import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';

describe('password reset', () => {
  let testApp;

  before(async () => {
    testApp = await buildTestApp();
  });

  after(async () => {
    await testApp.close();
  });

  function send(url, payload, accessToken) {
    return testApp.sendRequest({ method: 'POST', url, payload, accessToken });
  }

  function forgotPassword(email) {
    return send('/api/auth/forgot-password', { email });
  }

  function resetPassword(token, newPassword = 'a-brand-new-password') {
    return send('/api/auth/reset-password', { token, newPassword });
  }

  it('answers the same way for known and unknown emails', async () => {
    const user = await testApp.registerAndLogin();
    const sentBefore = testApp.mailer.sentEmails.length;

    const known = await forgotPassword(user.email.toUpperCase());
    const unknown = await forgotPassword('nobody-here@example.com');

    assert.equal(known.statusCode, 200);
    assert.equal(unknown.statusCode, 200);
    assert.equal(known.body.message, unknown.body.message);
    assert.equal(testApp.mailer.sentEmails.length, sentBefore + 1);
    assert.equal(
      testApp.mailer.findLastEmailTo('nobody-here@example.com'),
      null,
    );
  });

  it('emails a reset link that sets a new password and logs out every device', async () => {
    const user = await testApp.registerAndLogin();
    await forgotPassword(user.email);
    const email = testApp.mailer.findLastEmailTo(user.email);
    const token = testApp.mailer.readTokenFromLastEmailTo(user.email);

    assert.match(email.subject, /Reset your Mindcraft password/);
    assert.match(email.text, /http:\/\/localhost:3000\/reset-password\?token=/);
    assert.match(email.html, /Choose a new password/);

    const response = await resetPassword(token);
    const me = await testApp.sendRequest({
      method: 'GET',
      url: '/api/auth/me',
      accessToken: user.accessToken,
    });
    const oldLogin = await send('/api/auth/login', {
      email: user.email,
      password: 'secret123',
    });
    const newLogin = await send('/api/auth/login', {
      email: user.email,
      password: 'a-brand-new-password',
    });

    assert.equal(response.statusCode, 200);
    assert.equal(me.statusCode, 401);
    assert.equal(oldLogin.statusCode, 401);
    assert.equal(newLogin.statusCode, 200);
    assert.ok(newLogin.body.data.user.emailVerifiedAt);
  });

  it('accepts a reset link only once', async () => {
    const user = await testApp.registerAndLogin();
    await forgotPassword(user.email);
    const token = testApp.mailer.readTokenFromLastEmailTo(user.email);

    const first = await resetPassword(token);
    const second = await resetPassword(token, 'yet-another-password');

    assert.equal(first.statusCode, 200);
    assert.equal(second.statusCode, 400);
  });

  it('rejects an expired or made up link and a short password', async () => {
    const user = await testApp.registerAndLogin();
    await forgotPassword(user.email);
    const token = testApp.mailer.readTokenFromLastEmailTo(user.email);
    await testApp.runSql(
      "UPDATE auth_tokens SET expires_at = now() - interval '1 hour' WHERE user_id = $1",
      [user.user.id],
    );

    const expired = await resetPassword(token);
    const madeUp = await resetPassword('not-a-real-token');
    const short = await resetPassword(token, 'abc');

    assert.equal(expired.statusCode, 400);
    assert.equal(madeUp.statusCode, 400);
    assert.equal(short.statusCode, 400);
  });

  it('sends at most one email every two minutes and a new link replaces the old one', async () => {
    const user = await testApp.registerAndLogin();
    await forgotPassword(user.email);
    const firstToken = testApp.mailer.readTokenFromLastEmailTo(user.email);
    const countAfterFirst = testApp.mailer.sentEmails.length;

    await forgotPassword(user.email);
    assert.equal(testApp.mailer.sentEmails.length, countAfterFirst);

    await testApp.runSql(
      "UPDATE auth_tokens SET created_at = now() - interval '3 minutes' WHERE user_id = $1",
      [user.user.id],
    );
    await forgotPassword(user.email);
    const secondToken = testApp.mailer.readTokenFromLastEmailTo(user.email);

    assert.notEqual(secondToken, firstToken);
    assert.equal((await resetPassword(firstToken)).statusCode, 400);
    assert.equal((await resetPassword(secondToken)).statusCode, 200);
  });
});
