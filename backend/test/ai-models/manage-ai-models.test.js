import { randomUUID } from 'node:crypto';
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';

const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

describe('admin AI models list, detail, update and status', () => {
  let testApp;
  let admin;
  let provider;
  let otherProvider;
  const createdProviderIds = [];

  before(async () => {
    testApp = await buildTestApp();
    admin = await testApp.registerAndLoginAsAdmin();
    provider = await createProvider('Provider A');
    otherProvider = await createProvider('Provider B');
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

  function send(method, url, payload, accessToken = admin.accessToken) {
    return testApp.sendRequest({ method, url, accessToken, payload });
  }

  async function createProvider(name) {
    const response = await send('POST', '/api/admin/providers', {
      code: uniqueText('test'),
      name,
    });
    createdProviderIds.push(response.body.data.provider.id);

    return response.body.data.provider;
  }

  async function createModel(overrides = {}) {
    const response = await send('POST', '/api/admin/models', {
      providerId: provider.id,
      name: 'Model',
      slug: uniqueText('test-model'),
      providerModelId: uniqueText('model-id'),
      ...overrides,
    });

    return response.body.data.model;
  }

  function listModels(query) {
    return send('GET', `/api/admin/models?${new URLSearchParams(query)}`);
  }

  describe('GET /api/admin/models', () => {
    it('lists models with their provider and pagination meta', async () => {
      await createModel({ name: 'Alpha', sortOrder: 1 });
      await createModel({ name: 'Beta', sortOrder: 2 });
      await createModel({ name: 'Gamma', sortOrder: 3 });

      const firstPage = await listModels({
        providerId: provider.id,
        limit: 2,
        page: 1,
      });
      const secondPage = await listModels({
        providerId: provider.id,
        limit: 2,
        page: 2,
      });

      assert.equal(firstPage.statusCode, 200);
      assert.deepEqual(
        firstPage.body.data.models.map((model) => model.name),
        ['Alpha', 'Beta'],
      );
      assert.equal(firstPage.body.data.models[0].provider.name, 'Provider A');
      assert.equal(firstPage.body.meta.total, 3);
      assert.equal(firstPage.body.meta.totalPages, 2);
      assert.deepEqual(
        secondPage.body.data.models.map((model) => model.name),
        ['Gamma'],
      );
    });

    it('filters by provider', async () => {
      const model = await createModel({ providerId: otherProvider.id });

      const response = await listModels({ providerId: otherProvider.id });

      assert.deepEqual(
        response.body.data.models.map((item) => item.id),
        [model.id],
      );
    });

    it('filters by status', async () => {
      const model = await createModel({ providerId: otherProvider.id });
      await send('PATCH', `/api/admin/models/${model.id}/status`, {
        status: 'deprecated',
      });

      const response = await listModels({
        providerId: otherProvider.id,
        status: 'deprecated',
      });

      assert.deepEqual(
        response.body.data.models.map((item) => item.id),
        [model.id],
      );
    });

    it('searches name, slug and provider model ID without case', async () => {
      const marker = uniqueText('needle');
      const byName = await createModel({ name: `Image ${marker}` });
      const byModelId = await createModel({ providerModelId: marker });

      const response = await listModels({ search: marker.toUpperCase() });
      const ids = response.body.data.models.map((model) => model.id);

      assert.ok(ids.includes(byName.id));
      assert.ok(ids.includes(byModelId.id));
      assert.equal(ids.length, 2);
    });

    it('treats % in search as a normal character', async () => {
      const response = await listModels({
        search: '%',
        providerId: provider.id,
      });

      assert.equal(response.statusCode, 200);
      assert.equal(response.body.data.models.length, 0);
    });

    it('rejects invalid query values', async () => {
      const response = await listModels({ limit: 500, status: 'unknown' });

      assert.equal(response.statusCode, 400);
    });
  });

  describe('GET /api/admin/models/:id', () => {
    it('returns the model with its provider', async () => {
      const model = await createModel();

      const response = await send('GET', `/api/admin/models/${model.id}`);

      assert.equal(response.statusCode, 200);
      assert.equal(response.body.data.model.slug, model.slug);
      assert.equal(response.body.data.model.provider.id, provider.id);
    });

    it('returns 404 for an unknown id', async () => {
      const response = await send('GET', `/api/admin/models/${UNKNOWN_ID}`);

      assert.equal(response.statusCode, 404);
    });
  });

  describe('PATCH /api/admin/models/:id', () => {
    it('updates name, description and sort order and records the admin', async () => {
      const model = await createModel({ description: 'Old' });

      const response = await send('PATCH', `/api/admin/models/${model.id}`, {
        name: '  Renamed  ',
        description: null,
        sortOrder: 5,
      });

      assert.equal(response.statusCode, 200);
      assert.equal(response.body.data.model.name, 'Renamed');
      assert.equal(response.body.data.model.description, null);
      assert.equal(response.body.data.model.sortOrder, 5);
      assert.equal(response.body.data.model.updatedBy, admin.user.id);
    });

    it('never changes provider, slug or provider model ID', async () => {
      const model = await createModel();

      const response = await send('PATCH', `/api/admin/models/${model.id}`, {
        name: 'Same identity',
        providerId: otherProvider.id,
        slug: uniqueText('changed'),
        providerModelId: 'changed',
      });

      assert.equal(response.body.data.model.providerId, provider.id);
      assert.equal(response.body.data.model.slug, model.slug);
      assert.equal(
        response.body.data.model.providerModelId,
        model.providerModelId,
      );
    });

    it('rejects an empty update and returns 404 for an unknown id', async () => {
      const model = await createModel();

      const empty = await send('PATCH', `/api/admin/models/${model.id}`, {});
      const missing = await send('PATCH', `/api/admin/models/${UNKNOWN_ID}`, {
        name: 'Nobody',
      });

      assert.equal(empty.statusCode, 400);
      assert.equal(missing.statusCode, 404);
    });
  });

  describe('PATCH /api/admin/models/:id/status', () => {
    it('moves a model between draft, disabled and deprecated', async () => {
      const model = await createModel();

      for (const status of ['disabled', 'deprecated', 'draft']) {
        const response = await send(
          'PATCH',
          `/api/admin/models/${model.id}/status`,
          { status },
        );

        assert.equal(response.statusCode, 200);
        assert.equal(response.body.data.model.status, status);
        assert.equal(response.body.data.model.updatedBy, admin.user.id);
      }
    });

    it('rejects an unknown status and an unknown id', async () => {
      const model = await createModel();

      const invalid = await send(
        'PATCH',
        `/api/admin/models/${model.id}/status`,
        { status: 'archived' },
      );
      const missing = await send(
        'PATCH',
        `/api/admin/models/${UNKNOWN_ID}/status`,
        { status: 'active' },
      );

      assert.equal(invalid.statusCode, 400);
      assert.equal(missing.statusCode, 404);
    });
  });

  it('allows only admins on every endpoint', async () => {
    const model = await createModel();
    const user = await testApp.registerAndLogin();

    const responses = await Promise.all([
      send('GET', '/api/admin/models', undefined, user.accessToken),
      send('GET', `/api/admin/models/${model.id}`, undefined, user.accessToken),
      send(
        'PATCH',
        `/api/admin/models/${model.id}`,
        { name: 'X' },
        user.accessToken,
      ),
      send(
        'PATCH',
        `/api/admin/models/${model.id}/status`,
        { status: 'active' },
        user.accessToken,
      ),
    ]);

    assert.deepEqual(
      responses.map((response) => response.statusCode),
      [403, 403, 403, 403],
    );
  });
});
