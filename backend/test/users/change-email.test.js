import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TEST_PASSWORD, buildTestApp } from '../helpers/test-app.js';

describe('change email', () => {
  let testApp;

  before(async () => {
    testApp = await buildTestApp();
  });

  after(async () => {
    await testApp.close();
  });

  function requestChange(user, newEmail, currentPassword = TEST_PASSWORD) {
    return testApp.sendRequest({
      method: 'POST',
      url: '/api/me/email',
      accessToken: user.accessToken,
      payload: { newEmail, currentPassword },
    });
  }

  function verify(token) {
    return testApp.sendRequest({
      method: 'POST',
      url: '/api/auth/verify-email',
      payload: { token },
    });
  }

  it('changes the email only after the link sent to the new address is opened', async () => {
    const user = await testApp.registerAndLogin();
    const newEmail = testApp.makeEmail();

    const response = await requestChange(user, newEmail.toUpperCase());
    const meBefore = await testApp.sendRequest({
      method: 'GET',
      url: '/api/auth/me',
      accessToken: user.accessToken,
    });
    const token = testApp.mailer.readTokenFromLastEmailTo(newEmail);
    const confirmed = await verify(token);
    const notice = testApp.mailer.findLastEmailTo(user.email);
    const meAfter = await testApp.sendRequest({
      method: 'GET',
      url: '/api/auth/me',
      accessToken: user.accessToken,
    });
    const loginWithNewEmail = await testApp.sendRequest({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: newEmail, password: TEST_PASSWORD },
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.newEmail, newEmail);
    assert.equal(meBefore.body.data.user.email, user.email);
    assert.equal(confirmed.statusCode, 200);
    assert.equal(confirmed.body.data.emailChanged, true);
    assert.match(notice.subject, /Your Mindcraft email was changed/);
    assert.equal(meAfter.body.data.user.email, newEmail);
    assert.ok(meAfter.body.data.user.emailVerifiedAt);
    assert.equal(loginWithNewEmail.statusCode, 200);
  });

  it('needs the right password, a new address and one nobody uses', async () => {
    const user = await testApp.registerAndLogin();
    const other = await testApp.registerAndLogin();

    const wrongPassword = await requestChange(
      user,
      testApp.makeEmail(),
      'not-my-password',
    );
    const sameEmail = await requestChange(user, user.email);
    const takenEmail = await requestChange(user, other.email);

    assert.equal(wrongPassword.statusCode, 400);
    assert.equal(sameEmail.statusCode, 400);
    assert.equal(takenEmail.statusCode, 409);
  });

  it('refuses the change when the address got taken before the link was opened', async () => {
    const user = await testApp.registerAndLogin();
    const newEmail = testApp.makeEmail();
    await requestChange(user, newEmail);
    const token = testApp.mailer.readTokenFromLastEmailTo(newEmail);

    await testApp.sendRequest({
      method: 'POST',
      url: '/api/auth/register',
      payload: { name: 'Quick', email: newEmail, password: TEST_PASSWORD },
    });
    const confirmed = await verify(token);

    assert.equal(confirmed.statusCode, 409);
  });

  it('waits a minute between change emails and requires login', async () => {
    const user = await testApp.registerAndLogin();

    const first = await requestChange(user, testApp.makeEmail());
    const second = await requestChange(user, testApp.makeEmail());
    const anonymous = await testApp.sendRequest({
      method: 'POST',
      url: '/api/me/email',
      payload: { newEmail: 'a@example.com', currentPassword: TEST_PASSWORD },
    });

    assert.equal(first.statusCode, 200);
    assert.equal(second.statusCode, 429);
    assert.equal(anonymous.statusCode, 401);
  });
});
