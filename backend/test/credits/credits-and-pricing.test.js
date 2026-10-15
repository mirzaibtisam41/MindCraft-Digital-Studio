import { randomUUID } from 'node:crypto';
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';
import { applyCreditChangeService } from '#src/modules/credit-wallets/shared/services/index.js';

const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

const WORKFLOW_OPTIONS = {
  isEnabled: true,
  enabledOptions: {
    sizes: ['1024x1024'],
    qualities: ['medium', 'high'],
    outputFormats: ['png'],
    maxImagesPerRequest: 2,
  },
  defaultOptions: {
    size: '1024x1024',
    quality: 'medium',
    outputFormat: 'png',
    n: 1,
  },
};

describe('credits and pricing', () => {
  let testApp;
  let admin;
  let savedSignupCredits;
  let textToImageId;
  let providerId;

  before(async () => {
    testApp = await buildTestApp();
    admin = await testApp.registerAndLoginAsAdmin();

    const [setting] = await testApp.runSql(
      "SELECT value FROM platform_settings WHERE key = 'signup_credits'",
    );
    savedSignupCredits = setting.value;
    await testApp.runSql(
      "UPDATE platform_settings SET value = '60'::jsonb WHERE key = 'signup_credits'",
    );

    const [type] = await testApp.runSql(
      "SELECT id FROM generation_types WHERE code = 'text_to_image'",
    );
    textToImageId = type.id;

    const provider = await send('POST', '/api/admin/providers', {
      code: `test-${randomUUID().slice(0, 8)}`,
      name: 'Credits Provider',
    });
    providerId = provider.body.data.provider.id;
  });

  after(async () => {
    await testApp.runSql(
      "UPDATE platform_settings SET value = $1::jsonb WHERE key = 'signup_credits'",
      [JSON.stringify(savedSignupCredits)],
    );
    await testApp.runSql('DELETE FROM ai_models WHERE provider_id = $1', [
      providerId,
    ]);
    await testApp.runSql('DELETE FROM ai_providers WHERE id = $1', [
      providerId,
    ]);
    await testApp.close();
  });

  function send(method, url, payload, accessToken = admin.accessToken) {
    return testApp.sendRequest({ method, url, accessToken, payload });
  }

  function getMyWallet(accessToken) {
    return send('GET', '/api/wallet', undefined, accessToken);
  }

  function adjustCredits(userId, payload) {
    return send(
      'POST',
      `/api/admin/users/${userId}/credit-adjustments`,
      payload,
    );
  }

  async function createModel() {
    const response = await send('POST', '/api/admin/models', {
      providerId,
      name: 'Priced Model',
      slug: `test-model-${randomUUID().slice(0, 8)}`,
      providerModelId: `priced-${randomUUID().slice(0, 8)}`,
    });

    return response.body.data.model;
  }

  function saveWorkflow(modelId, payload) {
    return send(
      'PUT',
      `/api/admin/models/${modelId}/workflows/${textToImageId}`,
      payload,
    );
  }

  function savePrices(modelId, prices) {
    return send(
      'PUT',
      `/api/admin/models/${modelId}/workflows/${textToImageId}/prices`,
      { prices },
    );
  }

  function changeStatus(modelId, status) {
    return send('PATCH', `/api/admin/models/${modelId}/status`, { status });
  }

  describe('signup credits', () => {
    it('gives a new user the signup credits with a ledger entry', async () => {
      const user = await testApp.registerAndLogin();

      const response = await getMyWallet(user.accessToken);
      const [entry] = response.body.data.transactions;

      assert.equal(response.statusCode, 200);
      assert.equal(response.body.data.balance, 60);
      assert.equal(response.body.data.transactions.length, 1);
      assert.equal(entry.type, 'signup_grant');
      assert.equal(entry.amount, 60);
      assert.equal(entry.balanceAfter, 60);
    });

    it('reads and changes the signup credits setting', async () => {
      const read = await send('GET', '/api/admin/settings');
      const changed = await send('PATCH', '/api/admin/settings', {
        signupCredits: 0,
      });
      const user = await testApp.registerAndLogin();
      const wallet = await getMyWallet(user.accessToken);
      await send('PATCH', '/api/admin/settings', { signupCredits: 60 });

      assert.equal(read.body.data.settings.signupCredits, 60);
      assert.equal(changed.body.data.settings.signupCredits, 0);
      assert.equal(wallet.body.data.balance, 0);
      assert.equal(wallet.body.data.transactions.length, 0);
    });

    it('rejects an invalid signup credits value', async () => {
      const response = await send('PATCH', '/api/admin/settings', {
        signupCredits: -5,
      });

      assert.equal(response.statusCode, 400);
    });
  });

  describe('admin credit adjustments', () => {
    it('adds and deducts credits with a reason and records the admin', async () => {
      const user = await testApp.registerAndLogin();

      const added = await adjustCredits(user.user.id, {
        amount: 100,
        reason: '  Bug compensation  ',
      });
      const deducted = await adjustCredits(user.user.id, {
        amount: -50,
        reason: 'Correction',
      });
      const wallet = await send(
        'GET',
        `/api/admin/users/${user.user.id}/wallet`,
      );

      assert.equal(added.statusCode, 201);
      assert.equal(added.body.data.balance, 160);
      assert.equal(added.body.data.transaction.type, 'admin_credit');
      assert.equal(added.body.data.transaction.reason, 'Bug compensation');
      assert.equal(added.body.data.transaction.createdBy, admin.user.id);
      assert.equal(deducted.body.data.balance, 110);
      assert.equal(deducted.body.data.transaction.type, 'admin_debit');
      assert.equal(wallet.body.data.balance, 110);
      assert.deepEqual(
        wallet.body.data.transactions.map((entry) => entry.amount),
        [-50, 100, 60],
      );
    });

    it('never lets the balance go below zero', async () => {
      const user = await testApp.registerAndLogin();

      const response = await adjustCredits(user.user.id, {
        amount: -61,
        reason: 'Too much',
      });
      const wallet = await getMyWallet(user.accessToken);

      assert.equal(response.statusCode, 400);
      assert.match(response.body.message, /Not enough credits/);
      assert.equal(wallet.body.data.balance, 60);
      assert.equal(wallet.body.data.transactions.length, 1);
    });

    it('requires a reason and a non-zero amount', async () => {
      const user = await testApp.registerAndLogin();

      const noReason = await adjustCredits(user.user.id, { amount: 10 });
      const zero = await adjustCredits(user.user.id, {
        amount: 0,
        reason: 'Nothing',
      });

      assert.equal(noReason.statusCode, 400);
      assert.equal(zero.statusCode, 400);
    });

    it('returns 404 for an unknown user', async () => {
      const adjust = await adjustCredits(UNKNOWN_ID, {
        amount: 10,
        reason: 'Nobody',
      });
      const wallet = await send('GET', `/api/admin/users/${UNKNOWN_ID}/wallet`);

      assert.equal(adjust.statusCode, 404);
      assert.equal(wallet.statusCode, 404);
    });

    it('lets parallel debits spend the balance only once', async () => {
      const user = await testApp.registerAndLogin();

      const responses = await Promise.all(
        Array.from({ length: 5 }, () =>
          adjustCredits(user.user.id, { amount: -20, reason: 'Parallel' }),
        ),
      );
      const succeeded = responses.filter((r) => r.statusCode === 201).length;
      const wallet = await getMyWallet(user.accessToken);
      const lastEntry = wallet.body.data.transactions[0];

      assert.equal(succeeded, 3);
      assert.equal(wallet.body.data.balance, 0);
      assert.equal(lastEntry.balanceAfter, 0);
    });

    it('applies a change with the same idempotency key only once', async () => {
      const user = await testApp.registerAndLogin();
      const change = (tx) =>
        applyCreditChangeService({
          db: tx,
          userId: user.user.id,
          amount: 25,
          type: 'admin_credit',
          idempotencyKey: `test:${randomUUID()}`,
        });
      const key = `test:${randomUUID()}`;
      const sameKeyChange = (tx) =>
        applyCreditChangeService({
          db: tx,
          userId: user.user.id,
          amount: 25,
          type: 'admin_credit',
          idempotencyKey: key,
        });

      await testApp.app.db.transaction(change);
      const first = await testApp.app.db.transaction(sameKeyChange);
      const second = await testApp.app.db.transaction(sameKeyChange);
      const wallet = await getMyWallet(user.accessToken);

      assert.equal(first.transaction.id, second.transaction.id);
      assert.equal(wallet.body.data.balance, 110);
      assert.equal(wallet.body.data.transactions.length, 3);
    });

    it('allows only admins to adjust credits or read other wallets', async () => {
      const user = await testApp.registerAndLogin();

      const adjust = await send(
        'POST',
        `/api/admin/users/${user.user.id}/credit-adjustments`,
        { amount: 1000, reason: 'Free money' },
        user.accessToken,
      );
      const settings = await send(
        'PATCH',
        '/api/admin/settings',
        { signupCredits: 9999 },
        user.accessToken,
      );
      const guestWallet = await getMyWallet(null);

      assert.equal(adjust.statusCode, 403);
      assert.equal(settings.statusCode, 403);
      assert.equal(guestWallet.statusCode, 401);
    });
  });

  describe('model prices and activation', () => {
    it('refuses prices before the workflow is saved with options', async () => {
      const model = await createModel();

      const response = await savePrices(model.id, { medium: 4 });

      assert.equal(response.statusCode, 400);
      assert.match(response.body.message, /Save this workflow/);
    });

    it('saves prices only for enabled qualities', async () => {
      const model = await createModel();
      await saveWorkflow(model.id, WORKFLOW_OPTIONS);

      const saved = await savePrices(model.id, { medium: 4, high: 8 });
      const notEnabled = await savePrices(model.id, { low: 2 });
      const unknown = await savePrices(model.id, { ultra: 20 });
      const list = await send('GET', `/api/admin/models/${model.id}/prices`);

      assert.equal(saved.statusCode, 200);
      assert.equal(notEnabled.statusCode, 400);
      assert.equal(unknown.statusCode, 400);
      assert.deepEqual(
        list.body.data.prices
          .map((price) => [price.quality, price.creditsPerImage])
          .sort(),
        [
          ['high', 8],
          ['medium', 4],
        ],
      );
    });

    it('removes the price of a quality taken out of the workflow', async () => {
      const model = await createModel();
      await saveWorkflow(model.id, WORKFLOW_OPTIONS);
      await savePrices(model.id, { medium: 4, high: 8 });

      await saveWorkflow(model.id, {
        ...WORKFLOW_OPTIONS,
        enabledOptions: {
          ...WORKFLOW_OPTIONS.enabledOptions,
          qualities: ['medium'],
        },
      });
      const list = await send('GET', `/api/admin/models/${model.id}/prices`);

      assert.deepEqual(
        list.body.data.prices.map((price) => price.quality),
        ['medium'],
      );
    });

    it('activates a model only with an enabled, fully priced workflow', async () => {
      const model = await createModel();

      const noWorkflow = await changeStatus(model.id, 'active');
      await saveWorkflow(model.id, WORKFLOW_OPTIONS);
      await savePrices(model.id, { medium: 4 });
      const missingPrice = await changeStatus(model.id, 'active');
      await savePrices(model.id, { medium: 4, high: 8 });
      const activated = await changeStatus(model.id, 'active');

      assert.equal(noWorkflow.statusCode, 400);
      assert.match(noWorkflow.body.message, /at least one workflow/);
      assert.equal(missingPrice.statusCode, 400);
      assert.match(missingPrice.body.message, /Text to Image \(high\)/);
      assert.equal(activated.statusCode, 200);
      assert.equal(activated.body.data.model.status, 'active');
    });
  });
});
