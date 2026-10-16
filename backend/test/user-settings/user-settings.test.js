import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';

const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

describe('user settings API', () => {
  let testApp;

  before(async () => {
    testApp = await buildTestApp();
  });

  after(async () => {
    await testApp.close();
  });

  function send(method, accessToken, payload) {
    return testApp.sendRequest({
      method,
      url: '/api/me/settings',
      accessToken,
      payload,
    });
  }

  it('requires login', async () => {
    const response = await send('GET');

    assert.equal(response.statusCode, 401);
  });

  it('returns the defaults before anything is saved', async () => {
    const user = await testApp.registerAndLogin();

    const response = await send('GET', user.accessToken);

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body.data.settings, {
      defaultModelId: null,
      defaultSize: null,
      defaultQuality: null,
      defaultImageCount: null,
      notifyGenerationFailed: true,
      notifyCreditChanges: true,
      notifyLowCredits: true,
      lowCreditThreshold: 20,
    });
  });

  it('saves only the fields that were sent', async () => {
    const user = await testApp.registerAndLogin();

    await send('PATCH', user.accessToken, {
      defaultSize: '1536x1024',
      defaultImageCount: 2,
    });
    const response = await send('PATCH', user.accessToken, {
      notifyLowCredits: false,
      lowCreditThreshold: 50,
    });
    const saved = await send('GET', user.accessToken);

    assert.equal(response.statusCode, 200);
    assert.equal(saved.body.data.settings.defaultSize, '1536x1024');
    assert.equal(saved.body.data.settings.defaultImageCount, 2);
    assert.equal(saved.body.data.settings.notifyLowCredits, false);
    assert.equal(saved.body.data.settings.lowCreditThreshold, 50);
    assert.equal(saved.body.data.settings.notifyGenerationFailed, true);
  });

  it('accepts an active model, clears it with null and rejects unknown models', async () => {
    const user = await testApp.registerAndLogin();
    const [activeModel] = await testApp.runSql(
      "SELECT id FROM ai_models WHERE status = 'active' LIMIT 1",
    );

    if (activeModel) {
      const saved = await send('PATCH', user.accessToken, {
        defaultModelId: activeModel.id,
      });
      assert.equal(saved.body.data.settings.defaultModelId, activeModel.id);
    }

    const cleared = await send('PATCH', user.accessToken, {
      defaultModelId: null,
    });
    const unknown = await send('PATCH', user.accessToken, {
      defaultModelId: UNKNOWN_ID,
    });

    assert.equal(cleared.statusCode, 200);
    assert.equal(cleared.body.data.settings.defaultModelId, null);
    assert.equal(unknown.statusCode, 400);
  });

  it('rejects options the generator does not have and an empty body', async () => {
    const user = await testApp.registerAndLogin();

    const size = await send('PATCH', user.accessToken, {
      defaultSize: '800x600',
    });
    const count = await send('PATCH', user.accessToken, {
      defaultImageCount: 9,
    });
    const threshold = await send('PATCH', user.accessToken, {
      lowCreditThreshold: 0,
    });
    const empty = await send('PATCH', user.accessToken, {});

    assert.equal(size.statusCode, 400);
    assert.equal(count.statusCode, 400);
    assert.equal(threshold.statusCode, 400);
    assert.equal(empty.statusCode, 400);
  });

  it('keeps settings per user', async () => {
    const first = await testApp.registerAndLogin();
    const second = await testApp.registerAndLogin();

    await send('PATCH', first.accessToken, { defaultQuality: 'high' });
    const response = await send('GET', second.accessToken);

    assert.equal(response.body.data.settings.defaultQuality, null);
  });
});
