import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TEST_PASSWORD, buildTestApp } from '../helpers/test-app.js';

describe('POST /api/auth/login', () => {
  let testApp;

  before(async () => {
    testApp = await buildTestApp();
  });

  after(async () => {
    await testApp.close();
  });

  function login(payload) {
    return testApp.sendRequest({
      method: 'POST',
      url: '/api/auth/login',
      payload,
    });
  }

  it('returns an access token and sets the refresh token cookie', async () => {
    const email = await testApp.registerUser();

    const response = await login({
      email: email.toUpperCase(),
      password: TEST_PASSWORD,
    });

    assert.equal(response.statusCode, 200);
    assert.ok(response.body.data.accessToken);
    assert.ok(response.refreshCookie);
    assert.equal(response.body.data.user.email, email);
    assert.equal('passwordHash' in response.body.data.user, false);
  });

  it('saves a session with only the hash of the refresh token', async () => {
    const email = await testApp.registerUser();
    const { refreshToken } = await testApp.loginUser({ email });

    const sessions = await testApp.runSql(
      `SELECT s.refresh_token_hash, s.family_id, s.revoked_at, u.last_login_at
       FROM auth_sessions s JOIN users u ON u.id = s.user_id
       WHERE u.email = $1`,
      [email],
    );

    assert.equal(sessions.length, 1);
    assert.notEqual(sessions[0].refresh_token_hash, refreshToken);
    assert.equal(sessions[0].refresh_token_hash.length, 64);
    assert.ok(sessions[0].family_id);
    assert.equal(sessions[0].revoked_at, null);
    assert.ok(sessions[0].last_login_at);
  });

  it('rejects a wrong password', async () => {
    const email = await testApp.registerUser();

    const response = await login({ email, password: 'wrong-password1' });

    assert.equal(response.statusCode, 401);
    assert.equal(response.body.message, 'Invalid email or password');
  });

  it('gives an unknown email the same answer as a wrong password', async () => {
    const response = await login({
      email: testApp.makeEmail(),
      password: TEST_PASSWORD,
    });

    assert.equal(response.statusCode, 401);
    assert.equal(response.body.message, 'Invalid email or password');
  });

  it('blocks a suspended user', async () => {
    const email = await testApp.registerUser();
    await testApp.runSql(
      "UPDATE users SET status = 'suspended' WHERE email = $1",
      [email],
    );

    const response = await login({ email, password: TEST_PASSWORD });

    assert.equal(response.statusCode, 403);
  });
});
