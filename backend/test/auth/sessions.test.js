import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';

describe('logout and session management', () => {
  let testApp;

  before(async () => {
    testApp = await buildTestApp();
  });

  after(async () => {
    await testApp.close();
  });

  function getMe(accessToken) {
    return testApp.sendRequest({
      method: 'GET',
      url: '/api/auth/me',
      accessToken,
    });
  }

  function listSessions(accessToken) {
    return testApp.sendRequest({
      method: 'GET',
      url: '/api/auth/sessions',
      accessToken,
    });
  }

  function revokeSession(accessToken, familyId) {
    return testApp.sendRequest({
      method: 'DELETE',
      url: `/api/auth/sessions/${familyId}`,
      accessToken,
    });
  }

  async function loginOnThreeDevices() {
    const email = await testApp.registerUser();
    const laptop = await testApp.loginUser({ email });
    const phone = await testApp.loginUser({ email });
    const tablet = await testApp.loginUser({ email });

    return { laptop, phone, tablet };
  }

  it('logout ends the login and clears the cookie', async () => {
    const { accessToken, refreshToken } = await testApp.registerAndLogin();

    const response = await testApp.sendRequest({
      method: 'POST',
      url: '/api/auth/logout',
      refreshToken,
    });
    const refreshAfterLogout = await testApp.sendRequest({
      method: 'POST',
      url: '/api/auth/refresh',
      refreshToken,
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.refreshCookie, '');
    assert.equal((await getMe(accessToken)).statusCode, 401);
    assert.equal(refreshAfterLogout.statusCode, 401);
  });

  it('logout without a cookie still succeeds', async () => {
    const response = await testApp.sendRequest({
      method: 'POST',
      url: '/api/auth/logout',
    });

    assert.equal(response.statusCode, 200);
  });

  it('lists one session per device and marks the current one', async () => {
    const { laptop } = await loginOnThreeDevices();

    const response = await listSessions(laptop.accessToken);
    const sessions = response.body.data.sessions;

    assert.equal(response.statusCode, 200);
    assert.equal(sessions.length, 3);
    assert.equal(sessions.filter((session) => session.isCurrent).length, 1);
  });

  it('logs out one other device', async () => {
    const { laptop, phone } = await loginOnThreeDevices();
    const sessions = (await listSessions(laptop.accessToken)).body.data
      .sessions;
    const phoneFamilyId = (
      await listSessions(phone.accessToken)
    ).body.data.sessions.find((session) => session.isCurrent).familyId;

    const response = await revokeSession(laptop.accessToken, phoneFamilyId);

    assert.equal(sessions.length, 3);
    assert.equal(response.statusCode, 200);
    assert.equal((await getMe(phone.accessToken)).statusCode, 401);
    assert.equal((await getMe(laptop.accessToken)).statusCode, 200);
    assert.equal(
      (await revokeSession(laptop.accessToken, phoneFamilyId)).statusCode,
      404,
    );
  });

  it('cannot log out a session of another user', async () => {
    const attacker = await testApp.registerAndLogin();
    const victim = await testApp.registerAndLogin();
    const victimFamilyId = (await listSessions(victim.accessToken)).body.data
      .sessions[0].familyId;

    const response = await revokeSession(attacker.accessToken, victimFamilyId);

    assert.equal(response.statusCode, 404);
    assert.equal((await getMe(victim.accessToken)).statusCode, 200);
  });

  it('rejects a session id that is not a uuid', async () => {
    const { accessToken } = await testApp.registerAndLogin();

    const response = await revokeSession(accessToken, 'abc');

    assert.equal(response.statusCode, 400);
  });

  it('logs out every other device but keeps the current one', async () => {
    const { laptop, phone, tablet } = await loginOnThreeDevices();

    const response = await testApp.sendRequest({
      method: 'POST',
      url: '/api/auth/logout-others',
      accessToken: laptop.accessToken,
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.loggedOutCount, 2);
    assert.equal((await getMe(phone.accessToken)).statusCode, 401);
    assert.equal((await getMe(tablet.accessToken)).statusCode, 401);
    assert.equal((await getMe(laptop.accessToken)).statusCode, 200);
  });

  it('requires login for session endpoints', async () => {
    const response = await listSessions();

    assert.equal(response.statusCode, 401);
  });
});
