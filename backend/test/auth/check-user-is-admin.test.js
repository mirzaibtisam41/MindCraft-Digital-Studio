import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';

describe('checkUserIsAdminHook', () => {
  let testApp;

  before(async () => {
    testApp = await buildTestApp();
  });

  after(async () => {
    await testApp.close();
  });

  function pingAdminRoute(accessToken) {
    return testApp.sendRequest({
      method: 'GET',
      url: '/api/test-admin/ping',
      accessToken,
    });
  }

  it('rejects a request without a token with 401', async () => {
    const response = await pingAdminRoute();

    assert.equal(response.statusCode, 401);
  });

  it('rejects a normal user with 403', async () => {
    const { accessToken } = await testApp.registerAndLogin();

    const response = await pingAdminRoute(accessToken);

    assert.equal(response.statusCode, 403);
    assert.equal(response.body.message, 'Admin access required');
  });

  it('allows an admin', async () => {
    const { email, accessToken } = await testApp.registerAndLogin();
    await testApp.runSql("UPDATE users SET role = 'admin' WHERE email = $1", [
      email,
    ]);

    const response = await pingAdminRoute(accessToken);

    assert.equal(response.statusCode, 200);
  });

  it('takes away access as soon as the admin role is removed', async () => {
    const { email, accessToken } = await testApp.registerAndLogin();
    await testApp.runSql("UPDATE users SET role = 'admin' WHERE email = $1", [
      email,
    ]);
    await testApp.runSql("UPDATE users SET role = 'user' WHERE email = $1", [
      email,
    ]);

    const response = await pingAdminRoute(accessToken);

    assert.equal(response.statusCode, 403);
  });
});
