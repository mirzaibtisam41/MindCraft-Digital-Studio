import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';

describe('POST /api/auth/refresh', () => {
  let testApp;

  before(async () => {
    testApp = await buildTestApp();
  });

  after(async () => {
    await testApp.close();
  });

  function refresh(refreshToken) {
    return testApp.sendRequest({
      method: 'POST',
      url: '/api/auth/refresh',
      refreshToken,
    });
  }

  function getMe(accessToken) {
    return testApp.sendRequest({
      method: 'GET',
      url: '/api/auth/me',
      accessToken,
    });
  }

  it('gives a new refresh token and links the old session to the new one', async () => {
    const { email, refreshToken } = await testApp.registerAndLogin();

    const response = await refresh(refreshToken);

    assert.equal(response.statusCode, 200);
    assert.ok(response.body.data.accessToken);
    assert.notEqual(response.refreshCookie, refreshToken);

    const sessions = await testApp.runSql(
      `SELECT s.id, s.family_id, s.replaced_by_id, s.revoked_at
       FROM auth_sessions s JOIN users u ON u.id = s.user_id
       WHERE u.email = $1 ORDER BY s.created_at`,
      [email],
    );

    assert.equal(sessions.length, 2);
    assert.equal(sessions[0].family_id, sessions[1].family_id);
    assert.equal(sessions[0].replaced_by_id, sessions[1].id);
    assert.ok(sessions[0].revoked_at);
    assert.equal(sessions[1].revoked_at, null);
  });

  it('rejects a request without a cookie', async () => {
    const response = await refresh();

    assert.equal(response.statusCode, 401);
  });

  it('rejects an unknown refresh token', async () => {
    const response = await refresh('not-a-real-token');

    assert.equal(response.statusCode, 401);
  });

  it('rejects an expired refresh token', async () => {
    const { email, refreshToken } = await testApp.registerAndLogin();
    await testApp.runSql(
      `UPDATE auth_sessions SET expires_at = now() - interval '1 minute'
       WHERE user_id = (SELECT id FROM users WHERE email = $1)`,
      [email],
    );

    const response = await refresh(refreshToken);

    assert.equal(response.statusCode, 401);
  });

  it('allows an old token again within the grace period without ending the login', async () => {
    const { refreshToken } = await testApp.registerAndLogin();
    const first = await refresh(refreshToken);

    const reused = await refresh(refreshToken);
    const next = await refresh(first.refreshCookie);

    assert.equal(reused.statusCode, 401);
    assert.equal(next.statusCode, 200);
  });

  it('ends the whole login when an old token is reused after the grace period', async () => {
    const { email, refreshToken } = await testApp.registerAndLogin();
    const first = await refresh(refreshToken);
    await testApp.runSql(
      `UPDATE auth_sessions SET revoked_at = now() - interval '1 minute'
       WHERE replaced_by_id IS NOT NULL
         AND user_id = (SELECT id FROM users WHERE email = $1)`,
      [email],
    );

    const reused = await refresh(refreshToken);
    const newest = await refresh(first.refreshCookie);
    const me = await getMe(first.body.data.accessToken);

    assert.equal(reused.statusCode, 401);
    assert.equal(newest.statusCode, 401);
    assert.equal(me.statusCode, 401);
  });

  it('lets only one of two parallel refreshes win', async () => {
    const { refreshToken } = await testApp.registerAndLogin();

    const responses = await Promise.all([
      refresh(refreshToken),
      refresh(refreshToken),
    ]);
    const statusCodes = responses.map((response) => response.statusCode);
    const winner = responses.find((response) => response.statusCode === 200);

    assert.deepEqual(statusCodes.sort(), [200, 401]);
    assert.equal((await refresh(winner.refreshCookie)).statusCode, 200);
  });

  it('blocks a suspended user and ends their login', async () => {
    const { email, refreshToken } = await testApp.registerAndLogin();
    await testApp.runSql(
      "UPDATE users SET status = 'suspended' WHERE email = $1",
      [email],
    );

    const response = await refresh(refreshToken);
    const activeSessions = await testApp.runSql(
      `SELECT id FROM auth_sessions
       WHERE revoked_at IS NULL
         AND user_id = (SELECT id FROM users WHERE email = $1)`,
      [email],
    );

    assert.equal(response.statusCode, 403);
    assert.equal(activeSessions.length, 0);
  });
});
