import { setTimeout as wait } from 'node:timers/promises';
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';

describe('checkUserIsLoggedInHook (GET /api/auth/me)', () => {
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

  it('returns the logged-in user for a valid token', async () => {
    const { email, accessToken } = await testApp.registerAndLogin();

    const response = await getMe(accessToken);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.user.email, email);
  });

  it('rejects a request without a token', async () => {
    const response = await getMe();

    assert.equal(response.statusCode, 401);
    assert.equal(response.body.message, 'Please log in to continue');
  });

  it('rejects a token with a changed signature', async () => {
    const { accessToken } = await testApp.registerAndLogin();
    const lastCharacter = accessToken.at(-1) === 'A' ? 'B' : 'A';

    const response = await getMe(accessToken.slice(0, -1) + lastCharacter);

    assert.equal(response.statusCode, 401);
  });

  it('rejects an expired access token', async () => {
    const { user } = await testApp.registerAndLogin();
    const [session] = await testApp.runSql(
      'SELECT id, family_id FROM auth_sessions WHERE user_id = $1',
      [user.id],
    );
    const shortLivedToken = testApp.app.jwt.sign(
      { sub: user.id, sid: session.id, fid: session.family_id },
      { expiresIn: '1s' },
    );

    await wait(1100);
    const response = await getMe(shortLivedToken);

    assert.equal(response.statusCode, 401);
  });

  it('rejects a token whose login was logged out', async () => {
    const { accessToken, refreshToken } = await testApp.registerAndLogin();

    await testApp.sendRequest({
      method: 'POST',
      url: '/api/auth/logout',
      refreshToken,
    });
    const response = await getMe(accessToken);

    assert.equal(response.statusCode, 401);
  });

  it('rejects a token whose login has expired', async () => {
    const { user, accessToken } = await testApp.registerAndLogin();
    await testApp.runSql(
      "UPDATE auth_sessions SET expires_at = now() - interval '1 minute' WHERE user_id = $1",
      [user.id],
    );

    const response = await getMe(accessToken);

    assert.equal(response.statusCode, 401);
  });

  it('blocks a suspended user', async () => {
    const { email, accessToken } = await testApp.registerAndLogin();
    await testApp.runSql(
      "UPDATE users SET status = 'suspended' WHERE email = $1",
      [email],
    );

    const response = await getMe(accessToken);

    assert.equal(response.statusCode, 403);
  });
});
