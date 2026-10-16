import { randomUUID } from 'node:crypto';
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';
import { ProviderError } from '#src/utils/index.js';
import { refundStuckGenerationsService } from '#src/modules/generations/shared/services/index.js';

const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

const OPTIONS = {
  size: '1024x1024',
  quality: 'medium',
  outputFormat: 'png',
  n: 2,
};

describe('generations API', () => {
  let testApp;
  let admin;
  let textToImageId;
  let provider;
  let createdProvider = false;
  let providerWasActive = true;
  let activeModel;
  let draftModel;

  before(async () => {
    testApp = await buildTestApp();
    admin = await testApp.registerAndLoginAsAdmin();

    const [type] = await testApp.runSql(
      "SELECT id FROM generation_types WHERE code = 'text_to_image'",
    );
    textToImageId = type.id;

    [provider] = await testApp.runSql(
      "SELECT id, is_active FROM ai_providers WHERE code = 'openai'",
    );

    if (provider) {
      providerWasActive = provider.is_active;
    } else {
      const created = await adminSend('POST', '/api/admin/providers', {
        code: 'openai',
        name: 'OpenAI',
      });
      provider = created.body.data.provider;
      createdProvider = true;
    }

    await adminSend('PATCH', `/api/admin/providers/${provider.id}/status`, {
      isActive: true,
    });

    activeModel = await createPricedModel();
    await adminSend('PATCH', `/api/admin/models/${activeModel.id}/status`, {
      status: 'active',
    });
    draftModel = await createPricedModel();
  });

  after(async () => {
    const modelIds = [activeModel.id, draftModel.id];

    await testApp.runSql('DELETE FROM generations WHERE model_id = ANY($1)', [
      modelIds,
    ]);
    await testApp.runSql('DELETE FROM ai_models WHERE id = ANY($1)', [
      modelIds,
    ]);

    if (createdProvider) {
      await testApp.runSql('DELETE FROM ai_providers WHERE id = $1', [
        provider.id,
      ]);
    } else if (!providerWasActive) {
      await testApp.runSql(
        'UPDATE ai_providers SET is_active = false WHERE id = $1',
        [provider.id],
      );
    }

    await testApp.close();
  });

  function adminSend(method, url, payload) {
    return testApp.sendRequest({
      method,
      url,
      payload,
      accessToken: admin.accessToken,
    });
  }

  function send(method, url, accessToken, payload) {
    return testApp.sendRequest({ method, url, payload, accessToken });
  }

  async function createPricedModel() {
    const created = await adminSend('POST', '/api/admin/models', {
      providerId: provider.id,
      name: `Test Model ${randomUUID().slice(0, 4)}`,
      slug: `test-model-${randomUUID().slice(0, 8)}`,
      providerModelId: `test-gen-${randomUUID().slice(0, 8)}`,
    });
    const model = created.body.data.model;

    await adminSend(
      'PUT',
      `/api/admin/models/${model.id}/workflows/${textToImageId}`,
      {
        isEnabled: true,
        enabledOptions: {
          sizes: ['1024x1024'],
          qualities: ['low', 'medium'],
          outputFormats: ['png'],
          maxImagesPerRequest: 3,
        },
        defaultOptions: {
          size: '1024x1024',
          quality: 'low',
          outputFormat: 'png',
          n: 1,
        },
      },
    );
    await adminSend(
      'PUT',
      `/api/admin/models/${model.id}/workflows/${textToImageId}/prices`,
      { prices: { low: 2, medium: 5 } },
    );

    return model;
  }

  async function registerUserWithCredits() {
    const user = await testApp.registerAndLogin();
    await testApp.runSql(
      'UPDATE credit_wallets SET balance = 60 WHERE user_id = $1',
      [user.user.id],
    );

    return user;
  }

  function generate(user, overrides = {}) {
    return send('POST', '/api/generations', user.accessToken, {
      modelId: activeModel.id,
      prompt: '  a red fox in the snow  ',
      options: OPTIONS,
      ...overrides,
    });
  }

  async function readBalance(userId) {
    const [wallet] = await testApp.runSql(
      'SELECT balance FROM credit_wallets WHERE user_id = $1',
      [userId],
    );

    return wallet.balance;
  }

  function storedKeysFor(userId) {
    return [...testApp.storage.files.keys()].filter((key) =>
      key.startsWith(`users/${userId}/generations/`),
    );
  }

  describe('GET /api/generations/options', () => {
    it('lists active models with their options and prices', async () => {
      const user = await registerUserWithCredits();

      const response = await send(
        'GET',
        '/api/generations/options',
        user.accessToken,
      );

      assert.equal(response.statusCode, 200);
      const models = response.body.data.models;
      const model = models.find((item) => item.id === activeModel.id);
      assert.ok(model);
      assert.equal(
        models.some((item) => item.id === draftModel.id),
        false,
      );
      assert.deepEqual(model.prices, { low: 2, medium: 5 });
      assert.deepEqual(model.enabledOptions.qualities, ['low', 'medium']);
      assert.equal(model.defaultOptions.quality, 'low');
      assert.equal(model.provider.name.length > 0, true);
    });
  });

  describe('POST /api/generations', () => {
    it('generates images, stores them and keeps the charge', async () => {
      const user = await registerUserWithCredits();
      testApp.openai.nextImageBuffers = [PNG_1X1, PNG_1X1];

      const response = await generate(user);

      assert.equal(response.statusCode, 201);
      assert.equal(response.body.message, '2 images generated');
      const { generation } = response.body.data;
      assert.equal(generation.status, 'succeeded');
      assert.equal(generation.prompt, 'a red fox in the snow');
      assert.equal(generation.totalCredits, 10);
      assert.equal(generation.model.id, activeModel.id);
      assert.equal(generation.images.length, 2);
      assert.ok(generation.images.every((image) => image.url));
      assert.ok(
        generation.images.every((image) => image.source === 'generated'),
      );

      const call = testApp.openai.calls.at(-1);
      assert.deepEqual(call, {
        model: activeModel.providerModelId,
        prompt: 'a red fox in the snow',
        size: '1024x1024',
        quality: 'medium',
        outputFormat: 'png',
        n: 2,
      });

      assert.deepEqual(
        storedKeysFor(user.user.id).sort(),
        generation.images
          .map((image) => `users/${user.user.id}/generations/${image.id}.png`)
          .sort(),
      );
      assert.ok(
        generation.images.every((image) =>
          testApp.storage.files.has(
            `users/${user.user.id}/thumbnails/${image.id}.webp`,
          ),
        ),
      );
      assert.equal(await readBalance(user.user.id), 50);

      const library = await send(
        'GET',
        `/api/images?modelId=${activeModel.id}&search=red%20fox`,
        user.accessToken,
      );
      assert.equal(library.body.data.images.length, 2);
      assert.equal(library.body.data.images[0].prompt, 'a red fox in the snow');
      assert.equal(library.body.data.images[0].model.id, activeModel.id);
    });

    it('refunds the credits when the safety filter blocks the prompt', async () => {
      const user = await registerUserWithCredits();
      testApp.openai.nextError = new ProviderError({
        category: 'safety_rejected',
      });

      const response = await generate(user);

      assert.equal(response.statusCode, 400);
      assert.match(response.body.message, /safety filter/);
      assert.match(response.body.message, /Your 10 credits were refunded/);
      assert.equal(await readBalance(user.user.id), 60);

      const [generation] = await testApp.runSql(
        'SELECT status, error_category FROM generations WHERE user_id = $1',
        [user.user.id],
      );
      assert.deepEqual(generation, {
        status: 'failed',
        error_category: 'safety_rejected',
      });
    });

    it('refunds and cleans up when the provider sends something that is not an image', async () => {
      const user = await registerUserWithCredits();
      testApp.openai.nextImageBuffers = [PNG_1X1, Buffer.from('not an image')];

      const response = await generate(user);

      assert.equal(response.statusCode, 503);
      assert.match(response.body.message, /refunded/);
      assert.equal(await readBalance(user.user.id), 60);
      assert.deepEqual(storedKeysFor(user.user.id), []);

      const images = await testApp.runSql(
        'SELECT id FROM images WHERE user_id = $1',
        [user.user.id],
      );
      assert.equal(images.length, 0);
    });

    it('maps a provider outage to a 503 without the provider details', async () => {
      const user = await registerUserWithCredits();
      testApp.openai.nextError = new ProviderError({
        category: 'provider_auth_failed',
        cause: new Error('Incorrect API key provided: sk-secret'),
      });

      const response = await generate(user);

      assert.equal(response.statusCode, 503);
      assert.equal(response.body.code, 'SERVICE_UNAVAILABLE');
      assert.equal(response.body.message.includes('sk-secret'), false);
      assert.equal(await readBalance(user.user.id), 60);
    });

    it('keeps no images when the generation was refunded while the provider was working', async () => {
      const user = await registerUserWithCredits();
      testApp.openai.nextImageBuffers = [PNG_1X1, PNG_1X1];
      testApp.openai.duringGenerate = async () => {
        await testApp.runSql(
          "UPDATE generations SET created_at = now() - interval '11 minutes' WHERE user_id = $1",
          [user.user.id],
        );
        await refundStuckGenerationsService({ db: testApp.app.db });
      };

      const response = await generate(user);

      assert.equal(response.statusCode, 503);
      assert.match(response.body.message, /Your 10 credits were refunded/);
      assert.equal(await readBalance(user.user.id), 60);
      assert.deepEqual(storedKeysFor(user.user.id), []);

      const images = await testApp.runSql(
        'SELECT id FROM images WHERE user_id = $1',
        [user.user.id],
      );
      assert.equal(images.length, 0);
    });

    it('does not call the provider without enough credits', async () => {
      const user = await registerUserWithCredits();
      await testApp.runSql(
        'UPDATE credit_wallets SET balance = 3 WHERE user_id = $1',
        [user.user.id],
      );
      const callsBefore = testApp.openai.calls.length;

      const response = await generate(user);

      assert.equal(response.statusCode, 400);
      assert.equal(
        response.body.message,
        'This generation costs 10 credits and you have 3',
      );
      assert.equal(testApp.openai.calls.length, callsBefore);
    });

    it('rejects options the model does not offer and inactive models', async () => {
      const user = await registerUserWithCredits();
      const callsBefore = testApp.openai.calls.length;

      const wrongSize = await generate(user, {
        options: { ...OPTIONS, size: '1536x1024' },
      });
      const draft = await generate(user, { modelId: draftModel.id });
      const blankPrompt = await generate(user, { prompt: '   ' });

      assert.equal(wrongSize.statusCode, 400);
      assert.equal(
        wrongSize.body.message,
        'This size is not available for this model',
      );
      assert.equal(draft.statusCode, 400);
      assert.equal(blankPrompt.statusCode, 400);
      assert.equal(testApp.openai.calls.length, callsBefore);
      assert.equal(await readBalance(user.user.id), 60);
    });

    it('needs a logged in user', async () => {
      const response = await send('POST', '/api/generations', 'bad-token', {
        modelId: activeModel.id,
        prompt: 'x',
        options: OPTIONS,
      });

      assert.equal(response.statusCode, 401);
    });
  });

  describe('GET /api/generations and /api/generations/:id', () => {
    it('lists only my generations, newest first, with images', async () => {
      const user = await registerUserWithCredits();
      const other = await testApp.registerAndLogin();
      testApp.openai.nextImageBuffers = [PNG_1X1];
      await generate(user, { options: { ...OPTIONS, n: 1 } });
      testApp.openai.nextError = new ProviderError({ category: 'timeout' });
      await generate(user, { options: { ...OPTIONS, n: 1 } });

      const mine = await send('GET', '/api/generations', user.accessToken);
      const theirs = await send('GET', '/api/generations', other.accessToken);

      assert.equal(mine.statusCode, 200);
      assert.deepEqual(
        mine.body.data.generations.map((item) => item.status),
        ['failed', 'succeeded'],
      );
      assert.equal(mine.body.data.generations[0].errorCategory, 'timeout');
      assert.equal(mine.body.data.generations[0].images.length, 0);
      assert.equal(mine.body.data.generations[1].images.length, 1);
      assert.equal(mine.body.meta.total, 2);
      assert.equal(theirs.body.data.generations.length, 0);
    });

    it('returns one of my generations and hides others', async () => {
      const user = await registerUserWithCredits();
      const other = await testApp.registerAndLogin();
      testApp.openai.nextImageBuffers = [PNG_1X1];
      const created = await generate(user, { options: { ...OPTIONS, n: 1 } });
      const { id } = created.body.data.generation;

      const mine = await send(
        'GET',
        `/api/generations/${id}`,
        user.accessToken,
      );
      const theirs = await send(
        'GET',
        `/api/generations/${id}`,
        other.accessToken,
      );
      const unknown = await send(
        'GET',
        `/api/generations/${UNKNOWN_ID}`,
        user.accessToken,
      );

      assert.equal(mine.statusCode, 200);
      assert.equal(mine.body.data.generation.images.length, 1);
      assert.equal(theirs.statusCode, 404);
      assert.equal(unknown.statusCode, 404);
      assert.equal(unknown.body.message, 'Generation not found');
    });
  });
});
