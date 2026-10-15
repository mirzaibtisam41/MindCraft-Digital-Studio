import { randomUUID } from 'node:crypto';
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';

const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

describe('admin AI providers CRUD', () => {
  let testApp;
  let admin;
  const createdCodes = [];

  before(async () => {
    testApp = await buildTestApp();
    admin = await testApp.registerAndLoginAsAdmin();
  });

  after(async () => {
    await testApp.runSql('DELETE FROM ai_providers WHERE code = ANY($1)', [
      createdCodes,
    ]);
    await testApp.close();
  });

  function makeCode() {
    const code = `test-${randomUUID().slice(0, 8)}`;
    createdCodes.push(code);

    return code;
  }

  function send(method, url, payload, accessToken = admin.accessToken) {
    return testApp.sendRequest({ method, url, accessToken, payload });
  }

  async function createProvider(overrides = {}) {
    const response = await send('POST', '/api/admin/providers', {
      code: makeCode(),
      name: 'Test Provider',
      ...overrides,
    });

    return response.body.data.provider;
  }

  it('creates a provider, inactive by default, with a lowercase code', async () => {
    const code = makeCode();

    const response = await send('POST', '/api/admin/providers', {
      code: code.toUpperCase(),
      name: '  OpenAI  ',
    });

    assert.equal(response.statusCode, 201);
    assert.equal(response.body.data.provider.code, code);
    assert.equal(response.body.data.provider.name, 'OpenAI');
    assert.equal(response.body.data.provider.isActive, false);
  });

  it('rejects a duplicate code with 409', async () => {
    const provider = await createProvider();

    const response = await send('POST', '/api/admin/providers', {
      code: provider.code,
      name: 'Again',
    });

    assert.equal(response.statusCode, 409);
    assert.equal(
      response.body.message,
      'A provider with this code already exists',
    );
  });

  it('rejects invalid input', async () => {
    const response = await send('POST', '/api/admin/providers', {
      code: 'Open AI!',
    });

    assert.equal(response.statusCode, 400);
  });

  it('lists providers', async () => {
    const provider = await createProvider();

    const response = await send('GET', '/api/admin/providers');
    const codes = response.body.data.providers.map((item) => item.code);

    assert.equal(response.statusCode, 200);
    assert.ok(codes.includes(provider.code));
  });

  it('returns one provider and 404 for an unknown id', async () => {
    const provider = await createProvider();

    const found = await send('GET', `/api/admin/providers/${provider.id}`);
    const missing = await send('GET', `/api/admin/providers/${UNKNOWN_ID}`);

    assert.equal(found.statusCode, 200);
    assert.equal(found.body.data.provider.code, provider.code);
    assert.equal(missing.statusCode, 404);
  });

  it('updates the name but never the code', async () => {
    const provider = await createProvider();

    const response = await send(
      'PATCH',
      `/api/admin/providers/${provider.id}`,
      {
        name: '  Renamed  ',
        code: makeCode(),
      },
    );

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.provider.name, 'Renamed');
    assert.equal(response.body.data.provider.code, provider.code);
  });

  it('rejects an update without a name', async () => {
    const provider = await createProvider();

    const response = await send(
      'PATCH',
      `/api/admin/providers/${provider.id}`,
      {
        code: makeCode(),
      },
    );

    assert.equal(response.statusCode, 400);
  });

  it('rejects an empty update and returns 404 for an unknown id', async () => {
    const provider = await createProvider();

    const empty = await send(
      'PATCH',
      `/api/admin/providers/${provider.id}`,
      {},
    );
    const missing = await send('PATCH', `/api/admin/providers/${UNKNOWN_ID}`, {
      name: 'Nobody',
    });

    assert.equal(empty.statusCode, 400);
    assert.equal(missing.statusCode, 404);
  });

  it('activates and deactivates a provider', async () => {
    const provider = await createProvider();
    const url = `/api/admin/providers/${provider.id}/status`;

    const activated = await send('PATCH', url, { isActive: true });
    const deactivated = await send('PATCH', url, { isActive: false });
    const invalid = await send('PATCH', url, { isActive: 'yes' });

    assert.equal(activated.body.data.provider.isActive, true);
    assert.equal(deactivated.body.data.provider.isActive, false);
    assert.equal(invalid.statusCode, 400);
  });

  it('deletes a provider', async () => {
    const provider = await createProvider();

    const deleted = await send('DELETE', `/api/admin/providers/${provider.id}`);
    const afterDelete = await send(
      'GET',
      `/api/admin/providers/${provider.id}`,
    );
    const deleteAgain = await send(
      'DELETE',
      `/api/admin/providers/${provider.id}`,
    );

    assert.equal(deleted.statusCode, 200);
    assert.equal(afterDelete.statusCode, 404);
    assert.equal(deleteAgain.statusCode, 404);
  });

  it('allows only admins', async () => {
    const provider = await createProvider();
    const user = await testApp.registerAndLogin();

    const responses = await Promise.all([
      send('GET', '/api/admin/providers', undefined, user.accessToken),
      send(
        'POST',
        '/api/admin/providers',
        { code: makeCode(), name: 'X' },
        user.accessToken,
      ),
      send(
        'PATCH',
        `/api/admin/providers/${provider.id}`,
        { name: 'X' },
        user.accessToken,
      ),
      send(
        'DELETE',
        `/api/admin/providers/${provider.id}`,
        undefined,
        user.accessToken,
      ),
    ]);
    const asGuest = await send('GET', '/api/admin/providers', undefined, null);

    assert.deepEqual(
      responses.map((response) => response.statusCode),
      [403, 403, 403, 403],
    );
    assert.equal(asGuest.statusCode, 401);
  });
});
