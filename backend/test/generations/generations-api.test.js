import { randomUUID } from 'node:crypto';
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { buildTestApp } from '../helpers/test-app.js';
import { ProviderError } from '#src/utils/index.js';
import { refundStuckGenerationsService } from '#src/modules/generations/shared/services/index.js';

const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

function sharpPng(width, height) {
  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .png()
    .toBuffer();
}

const OPTIONS = {
  size: '1024x1024',
  quality: 'medium',
  outputFormat: 'png',
  n: 2,
};

describe('generations API', () => {
  let testApp;
  let admin;
  let typeIds;
  let provider;
  let createdProvider = false;
  let providerWasActive = true;
  let activeModel;
  let draftModel;

  before(async () => {
    testApp = await buildTestApp();
    admin = await testApp.registerAndLoginAsAdmin();

    const types = await testApp.runSql(
      "SELECT id, code FROM generation_types WHERE code IN ('text_to_image', 'image_to_image', 'image_edit')",
    );
    typeIds = types.map((type) => type.id);

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

    for (const typeId of typeIds) {
      await adminSend(
        'PUT',
        `/api/admin/models/${model.id}/workflows/${typeId}`,
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
        `/api/admin/models/${model.id}/workflows/${typeId}/prices`,
        { prices: { low: 2, medium: 5 } },
      );
    }

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

    it('filters history by status and search and counts each status', async () => {
      const user = await registerUserWithCredits();
      testApp.openai.nextImageBuffers = [PNG_1X1];
      await generate(user, {
        prompt: 'a blue whale',
        options: { ...OPTIONS, n: 1 },
      });
      testApp.openai.nextError = new ProviderError({ category: 'timeout' });
      await generate(user, {
        prompt: 'a green forest',
        options: { ...OPTIONS, n: 1 },
      });

      const failed = await send(
        'GET',
        '/api/generations?status=failed',
        user.accessToken,
      );
      const whale = await send(
        'GET',
        '/api/generations?search=whale',
        user.accessToken,
      );
      const wrongStatus = await send(
        'GET',
        '/api/generations?status=lost',
        user.accessToken,
      );

      assert.deepEqual(
        failed.body.data.generations.map((item) => item.prompt),
        ['a green forest'],
      );
      assert.deepEqual(failed.body.meta.statusCounts, {
        all: 2,
        processing: 0,
        succeeded: 1,
        failed: 1,
      });
      assert.deepEqual(
        whale.body.data.generations.map((item) => item.prompt),
        ['a blue whale'],
      );
      assert.equal(whale.body.meta.statusCounts.all, 1);
      assert.equal(wrongStatus.statusCode, 400);
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
  describe('image to image and edits', () => {
    const MASK = `data:image/png;base64,${PNG_1X1.toString('base64')}`;

    async function makeSourceImage(user) {
      testApp.openai.nextImageBuffers = [PNG_1X1];
      const created = await generate(user, { options: { ...OPTIONS, n: 1 } });

      return created.body.data.generation.images[0];
    }

    it('lists models by generation type', async () => {
      const user = await registerUserWithCredits();

      const response = await send(
        'GET',
        '/api/generations/options?type=image_edit',
        user.accessToken,
      );
      const wrongType = await send(
        'GET',
        '/api/generations/options?type=video',
        user.accessToken,
      );

      assert.ok(
        response.body.data.models.some((model) => model.id === activeModel.id),
      );
      assert.equal(wrongType.statusCode, 400);
    });

    it('creates variations from a starting image', async () => {
      const user = await registerUserWithCredits();
      const source = await makeSourceImage(user);
      testApp.openai.nextImageBuffers = [PNG_1X1, PNG_1X1];

      const response = await generate(user, {
        type: 'image_to_image',
        sourceImageId: source.id,
        prompt: 'make it a watercolor',
        options: { ...OPTIONS, n: 2 },
      });

      assert.equal(response.statusCode, 201);
      const { generation } = response.body.data;
      assert.equal(generation.sourceImageId, source.id);
      assert.equal(generation.images.length, 2);
      assert.ok(
        generation.images.every((image) => image.source === 'generated'),
      );

      const call = testApp.openai.calls.at(-1);
      assert.equal(call.isEdit, true);
      assert.equal(call.maskImage, null);
      assert.deepEqual(call.sourceImage.buffer, PNG_1X1);
      assert.equal(call.sourceImage.extension, 'png');
      assert.equal(await readBalance(user.user.id), 60 - 5 - 10);
    });

    it('edits the masked part and saves the result in the edits folder', async () => {
      const user = await registerUserWithCredits();
      const source = await makeSourceImage(user);
      testApp.openai.nextImageBuffers = [PNG_1X1];

      const response = await generate(user, {
        type: 'image_edit',
        sourceImageId: source.id,
        mask: MASK,
        prompt: 'add a red hat',
        options: { ...OPTIONS, n: 1 },
      });

      assert.equal(response.statusCode, 201);
      const [image] = response.body.data.generation.images;
      assert.equal(image.source, 'edited');
      assert.ok(
        testApp.storage.files.has(
          `users/${user.user.id}/edits/${image.id}.png`,
        ),
      );
      assert.deepEqual(testApp.openai.calls.at(-1).maskImage, PNG_1X1);

      const [saved] = await testApp.runSql(
        'SELECT options FROM generations WHERE id = $1',
        [response.body.data.generation.id],
      );
      assert.equal(saved.options.hasMask, true);
    });

    it('checks the starting image and the mask before charging', async () => {
      const user = await registerUserWithCredits();
      const other = await registerUserWithCredits();
      const source = await makeSourceImage(user);
      const theirs = await makeSourceImage(other);
      const balance = await readBalance(user.user.id);
      const callsBefore = testApp.openai.calls.length;
      const twoByOne = await sharpPng(2, 1);

      const noSource = await generate(user, { type: 'image_to_image' });
      const notMine = await generate(user, {
        type: 'image_to_image',
        sourceImageId: theirs.id,
      });
      const noMask = await generate(user, {
        type: 'image_edit',
        sourceImageId: source.id,
      });
      const wrongSizeMask = await generate(user, {
        type: 'image_edit',
        sourceImageId: source.id,
        mask: `data:image/png;base64,${twoByOne.toString('base64')}`,
      });
      const maskOnTextToImage = await generate(user, { mask: MASK });

      assert.equal(noSource.statusCode, 400);
      assert.equal(noSource.body.message, 'Choose an image to start from');
      assert.equal(notMine.statusCode, 404);
      assert.equal(noMask.statusCode, 400);
      assert.equal(
        noMask.body.message,
        'Paint over the part of the image you want to change',
      );
      assert.equal(wrongSizeMask.statusCode, 400);
      assert.equal(
        wrongSizeMask.body.message,
        'The mask must be a PNG the same size as the image',
      );
      assert.equal(maskOnTextToImage.statusCode, 400);
      assert.equal(testApp.openai.calls.length, callsBefore);
      assert.equal(await readBalance(user.user.id), balance);
    });

    it('refunds a failed edit', async () => {
      const user = await registerUserWithCredits();
      const source = await makeSourceImage(user);
      const balance = await readBalance(user.user.id);
      testApp.openai.nextError = new ProviderError({
        category: 'safety_rejected',
      });

      const response = await generate(user, {
        type: 'image_edit',
        sourceImageId: source.id,
        mask: MASK,
        options: { ...OPTIONS, n: 1 },
      });

      assert.equal(response.statusCode, 400);
      assert.match(response.body.message, /refunded/);
      assert.equal(await readBalance(user.user.id), balance);
    });
  });
});
