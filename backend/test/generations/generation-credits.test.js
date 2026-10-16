import { randomUUID } from 'node:crypto';
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';
import {
  completeGenerationService,
  estimateGenerationCostService,
  failGenerationService,
  refundStuckGenerationsService,
  startGenerationService,
} from '#src/modules/generations/shared/services/index.js';

const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

const OPTIONS = {
  size: '1024x1024',
  quality: 'medium',
  outputFormat: 'png',
  n: 2,
};

describe('generation credits', () => {
  let testApp;
  let admin;
  let providerId;
  let textToImageId;
  let activeModel;
  let draftModel;

  before(async () => {
    testApp = await buildTestApp();
    admin = await testApp.registerAndLoginAsAdmin();

    const [type] = await testApp.runSql(
      "SELECT id FROM generation_types WHERE code = 'text_to_image'",
    );
    textToImageId = type.id;

    const provider = await send('POST', '/api/admin/providers', {
      code: `test-${randomUUID().slice(0, 8)}`,
      name: 'Generation Provider',
    });
    providerId = provider.body.data.provider.id;
    await send('PATCH', `/api/admin/providers/${providerId}/status`, {
      isActive: true,
    });

    activeModel = await createPricedModel();
    await send('PATCH', `/api/admin/models/${activeModel.id}/status`, {
      status: 'active',
    });
    draftModel = await createPricedModel();
  });

  after(async () => {
    await testApp.runSql(
      'DELETE FROM generations WHERE model_id IN (SELECT id FROM ai_models WHERE provider_id = $1)',
      [providerId],
    );
    await testApp.runSql('DELETE FROM ai_models WHERE provider_id = $1', [
      providerId,
    ]);
    await testApp.runSql('DELETE FROM ai_providers WHERE id = $1', [
      providerId,
    ]);
    await testApp.close();
  });

  function send(method, url, payload) {
    return testApp.sendRequest({
      method,
      url,
      payload,
      accessToken: admin.accessToken,
    });
  }

  async function createPricedModel() {
    const created = await send('POST', '/api/admin/models', {
      providerId,
      name: 'Generation Model',
      slug: `test-model-${randomUUID().slice(0, 8)}`,
      providerModelId: `gen-${randomUUID().slice(0, 8)}`,
    });
    const model = created.body.data.model;

    await send(
      'PUT',
      `/api/admin/models/${model.id}/workflows/${textToImageId}`,
      {
        isEnabled: true,
        enabledOptions: {
          sizes: ['1024x1024'],
          qualities: ['low', 'medium'],
          outputFormats: ['png', 'webp'],
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
    await send(
      'PUT',
      `/api/admin/models/${model.id}/workflows/${textToImageId}/prices`,
      {
        prices: { low: 2, medium: 5 },
      },
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

  function estimate(overrides = {}) {
    return estimateGenerationCostService({
      db: testApp.app.db,
      modelId: activeModel.id,
      generationTypeCode: 'text_to_image',
      options: OPTIONS,
      ...overrides,
    });
  }

  async function readWallet(userId) {
    const [wallet] = await testApp.runSql(
      'SELECT balance FROM credit_wallets WHERE user_id = $1',
      [userId],
    );
    const transactions = await testApp.runSql(
      'SELECT t.type, t.amount, t.idempotency_key FROM credit_transactions t JOIN credit_wallets w ON w.id = t.wallet_id WHERE w.user_id = $1 ORDER BY t.created_at',
      [userId],
    );

    return { balance: wallet.balance, transactions };
  }

  async function startFor(user, options = OPTIONS) {
    const cost = await estimate({ options });

    return startGenerationService({
      db: testApp.app.db,
      userId: user.user.id,
      estimate: cost,
      prompt: 'a red fox in the snow',
      options,
    });
  }

  describe('estimateGenerationCostService', () => {
    it('multiplies the quality price by the number of images', async () => {
      const cost = await estimate();

      assert.equal(cost.creditsPerImage, 5);
      assert.equal(cost.totalCredits, 10);
      assert.equal(cost.model.id, activeModel.id);
      assert.ok(cost.modelWorkflowId);
    });

    it('rejects a model that is not active', async () => {
      await assert.rejects(estimate({ modelId: draftModel.id }), {
        message: 'This model is not available right now',
      });
      await assert.rejects(estimate({ modelId: UNKNOWN_ID }), {
        message: 'This model is not available right now',
      });
    });

    it('rejects a generation type the model does not offer', async () => {
      await assert.rejects(estimate({ generationTypeCode: 'image_to_image' }), {
        message: 'This model does not offer this kind of generation',
      });
    });

    it('rejects options outside the workflow', async () => {
      await assert.rejects(
        estimate({ options: { ...OPTIONS, size: '1536x1024' } }),
        { message: 'This size is not available for this model' },
      );
      await assert.rejects(
        estimate({ options: { ...OPTIONS, quality: 'high' } }),
        { message: 'This quality is not available for this model' },
      );
      await assert.rejects(
        estimate({ options: { ...OPTIONS, outputFormat: 'jpeg' } }),
        { message: 'This output format is not available for this model' },
      );
      await assert.rejects(estimate({ options: { ...OPTIONS, n: 4 } }), {
        message: 'This model makes 1 to 3 images per request',
      });
    });
  });

  describe('startGenerationService', () => {
    it('creates a processing generation and holds the credits', async () => {
      const user = await registerUserWithCredits();

      const generation = await startFor(user);

      assert.equal(generation.status, 'processing');
      assert.equal(generation.totalCredits, 10);
      assert.equal(generation.creditsPerImage, 5);
      assert.deepEqual(generation.options, OPTIONS);

      const wallet = await readWallet(user.user.id);
      assert.equal(wallet.balance, 50);
      assert.deepEqual(wallet.transactions.at(-1), {
        type: 'generation_hold',
        amount: -10,
        idempotency_key: `generation:${generation.id}:hold`,
      });
    });

    it('refuses to start without enough credits and saves nothing', async () => {
      const user = await registerUserWithCredits();
      await testApp.runSql(
        'UPDATE credit_wallets SET balance = 4 WHERE user_id = $1',
        [user.user.id],
      );

      await assert.rejects(startFor(user), {
        message: 'This generation costs 10 credits and you have 4',
      });

      const generations = await testApp.runSql(
        'SELECT id FROM generations WHERE user_id = $1',
        [user.user.id],
      );
      assert.equal(generations.length, 0);
      assert.equal((await readWallet(user.user.id)).balance, 4);
    });
  });

  describe('completeGenerationService', () => {
    it('marks the generation succeeded and keeps the hold', async () => {
      const user = await registerUserWithCredits();
      const generation = await startFor(user);

      const completed = await completeGenerationService({
        db: testApp.app.db,
        generationId: generation.id,
      });

      assert.equal(completed.status, 'succeeded');
      assert.ok(completed.completedAt);
      assert.equal((await readWallet(user.user.id)).balance, 50);
    });

    it('does nothing for a generation that already finished', async () => {
      const user = await registerUserWithCredits();
      const generation = await startFor(user);
      await completeGenerationService({
        db: testApp.app.db,
        generationId: generation.id,
      });

      const again = await failGenerationService({
        db: testApp.app.db,
        generationId: generation.id,
        errorCategory: 'unknown',
      });

      assert.equal(again, null);
      assert.equal((await readWallet(user.user.id)).balance, 50);
    });
  });

  describe('failGenerationService', () => {
    it('marks the generation failed and refunds the credits once', async () => {
      const user = await registerUserWithCredits();
      const generation = await startFor(user);

      const failed = await failGenerationService({
        db: testApp.app.db,
        generationId: generation.id,
        errorCategory: 'safety_rejected',
      });
      const secondTry = await failGenerationService({
        db: testApp.app.db,
        generationId: generation.id,
        errorCategory: 'safety_rejected',
      });

      assert.equal(failed.status, 'failed');
      assert.equal(failed.errorCategory, 'safety_rejected');
      assert.equal(secondTry, null);

      const wallet = await readWallet(user.user.id);
      assert.equal(wallet.balance, 60);
      assert.deepEqual(
        wallet.transactions
          .filter((entry) => entry.type.startsWith('generation_'))
          .map((entry) => [entry.type, entry.amount]),
        [
          ['generation_hold', -10],
          ['generation_refund', 10],
        ],
      );
      assert.equal(
        wallet.transactions.at(-1).idempotency_key,
        `generation:${generation.id}:refund`,
      );
    });

    it('refunds only once when two failures race', async () => {
      const user = await registerUserWithCredits();
      const generation = await startFor(user);

      const results = await Promise.all([
        failGenerationService({
          db: testApp.app.db,
          generationId: generation.id,
          errorCategory: 'timeout',
        }),
        failGenerationService({
          db: testApp.app.db,
          generationId: generation.id,
          errorCategory: 'timeout',
        }),
      ]);

      assert.equal(results.filter(Boolean).length, 1);
      assert.equal((await readWallet(user.user.id)).balance, 60);
    });
  });

  describe('refundStuckGenerationsService', () => {
    it('refunds generations stuck in processing for over 10 minutes', async () => {
      const user = await registerUserWithCredits();
      const stuck = await startFor(user, { ...OPTIONS, n: 1 });
      const recent = await startFor(user, { ...OPTIONS, n: 1 });
      await testApp.runSql(
        "UPDATE generations SET created_at = now() - interval '11 minutes' WHERE id = $1",
        [stuck.id],
      );

      await refundStuckGenerationsService({ db: testApp.app.db });
      const secondRun = await refundStuckGenerationsService({
        db: testApp.app.db,
      });

      const rows = await testApp.runSql(
        'SELECT id, status, error_category FROM generations WHERE user_id = $1',
        [user.user.id],
      );
      const byId = Object.fromEntries(rows.map((row) => [row.id, row]));

      assert.equal(byId[stuck.id].status, 'failed');
      assert.equal(byId[stuck.id].error_category, 'timeout');
      assert.equal(byId[recent.id].status, 'processing');
      assert.equal(secondRun, 0);
      assert.equal((await readWallet(user.user.id)).balance, 55);
    });
  });
});
