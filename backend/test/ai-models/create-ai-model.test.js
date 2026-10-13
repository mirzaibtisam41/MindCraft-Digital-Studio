import { randomUUID } from 'node:crypto';
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';

const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

describe('POST /api/admin/models', () => {
  let testApp;
  let admin;
  let provider;
  const createdProviderIds = [];

  before(async () => {
    testApp = await buildTestApp();
    admin = await testApp.registerAndLoginAsAdmin();
    provider = await createProvider();
  });

  after(async () => {
    await testApp.runSql('DELETE FROM ai_models WHERE provider_id = ANY($1)', [
      createdProviderIds,
    ]);
    await testApp.runSql('DELETE FROM ai_providers WHERE id = ANY($1)', [
      createdProviderIds,
    ]);
    await testApp.close();
  });

  function uniqueText(prefix) {
    return `${prefix}-${randomUUID().slice(0, 8)}`;
  }

  async function createProvider() {
    const response = await testApp.sendRequest({
      method: 'POST',
      url: '/api/admin/providers',
      accessToken: admin.accessToken,
      payload: { code: uniqueText('test'), name: 'Test Provider' },
    });
    createdProviderIds.push(response.body.data.provider.id);

    return response.body.data.provider;
  }

  function createModel(payload, accessToken = admin.accessToken) {
    return testApp.sendRequest({
      method: 'POST',
      url: '/api/admin/models',
      accessToken,
      payload: {
        providerId: provider.id,
        name: 'GPT Image 1',
        slug: uniqueText('test-model'),
        providerModelId: uniqueText('gpt-image'),
        ...payload,
      },
    });
  }

  it('creates a draft model owned by the admin who made it', async () => {
    const slug = uniqueText('test-model');

    const response = await createModel({
      name: '  GPT Image 1  ',
      slug: slug.toUpperCase(),
      description: '  AI image generation model  ',
      sortOrder: 1,
    });
    const model = response.body.data.model;

    assert.equal(response.statusCode, 201);
    assert.equal(model.providerId, provider.id);
    assert.equal(model.name, 'GPT Image 1');
    assert.equal(model.slug, slug);
    assert.equal(model.description, 'AI image generation model');
    assert.equal(model.status, 'draft');
    assert.equal(model.sortOrder, 1);
    assert.equal(model.createdBy, admin.user.id);
    assert.equal(model.updatedBy, null);
  });

  it('ignores status and createdBy sent in the body', async () => {
    const response = await createModel({
      status: 'active',
      createdBy: UNKNOWN_ID,
    });

    assert.equal(response.statusCode, 201);
    assert.equal(response.body.data.model.status, 'draft');
    assert.equal(response.body.data.model.createdBy, admin.user.id);
  });

  it('stores an empty description as null and defaults sortOrder to 0', async () => {
    const response = await createModel({ description: '   ' });

    assert.equal(response.body.data.model.description, null);
    assert.equal(response.body.data.model.sortOrder, 0);
  });

  it('rejects a provider that does not exist', async () => {
    const response = await createModel({ providerId: UNKNOWN_ID });

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.message, 'The selected provider does not exist');
  });

  it('rejects a slug that is already used', async () => {
    const first = await createModel();

    const response = await createModel({
      slug: first.body.data.model.slug,
    });

    assert.equal(response.statusCode, 409);
    assert.match(response.body.message, /slug/);
  });

  it('rejects the same provider model ID twice for one provider', async () => {
    const first = await createModel();

    const response = await createModel({
      providerModelId: first.body.data.model.providerModelId,
    });

    assert.equal(response.statusCode, 409);
    assert.match(response.body.message, /provider model ID/);
  });

  it('allows the same provider model ID under another provider', async () => {
    const otherProvider = await createProvider();
    const first = await createModel();

    const response = await createModel({
      providerId: otherProvider.id,
      providerModelId: first.body.data.model.providerModelId,
    });

    assert.equal(response.statusCode, 201);
  });

  it('rejects invalid input', async () => {
    const response = await testApp.sendRequest({
      method: 'POST',
      url: '/api/admin/models',
      accessToken: admin.accessToken,
      payload: {
        providerId: 'not-a-uuid',
        name: '',
        slug: 'has spaces',
        providerModelId: 'bad id!',
        sortOrder: -1,
      },
    });

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.code, 'VALIDATION_ERROR');
  });

  it('allows only admins', async () => {
    const user = await testApp.registerAndLogin();

    const asUser = await createModel({}, user.accessToken);
    const asGuest = await createModel({}, null);

    assert.equal(asUser.statusCode, 403);
    assert.equal(asGuest.statusCode, 401);
  });

  it('blocks deleting a provider that has models', async () => {
    const providerWithModel = await createProvider();
    await createModel({ providerId: providerWithModel.id });

    const response = await testApp.sendRequest({
      method: 'DELETE',
      url: `/api/admin/providers/${providerWithModel.id}`,
      accessToken: admin.accessToken,
    });

    assert.equal(response.statusCode, 409);
    assert.match(response.body.message, /has models/);
  });
});
