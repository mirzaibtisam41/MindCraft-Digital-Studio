import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TEST_PASSWORD, buildTestApp } from '../helpers/test-app.js';

describe('my account API', () => {
  let testApp;

  before(async () => {
    testApp = await buildTestApp();
  });

  after(async () => {
    await testApp.close();
  });

  function send(method, url, accessToken, payload) {
    return testApp.sendRequest({ method, url, accessToken, payload });
  }

  it('requires login', async () => {
    const profile = await send('PATCH', '/api/me/profile', undefined, {
      name: 'Nobody',
    });
    const password = await send('POST', '/api/me/password', undefined, {
      currentPassword: TEST_PASSWORD,
      newPassword: 'another-secret',
    });

    assert.equal(profile.statusCode, 401);
    assert.equal(password.statusCode, 401);
  });

  it('changes the name and keeps the email', async () => {
    const user = await testApp.registerAndLogin();

    const response = await send('PATCH', '/api/me/profile', user.accessToken, {
      name: '  Sara Malik  ',
    });
    const me = await send('GET', '/api/auth/me', user.accessToken);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.user.name, 'Sara Malik');
    assert.equal(me.body.data.user.name, 'Sara Malik');
    assert.equal(me.body.data.user.email, user.email);
  });

  it('rejects an empty name and never changes the email', async () => {
    const user = await testApp.registerAndLogin();

    const empty = await send('PATCH', '/api/me/profile', user.accessToken, {
      name: '   ',
    });
    const email = await send('PATCH', '/api/me/profile', user.accessToken, {
      name: 'Sara',
      email: 'new@example.com',
    });

    assert.equal(empty.statusCode, 400);
    assert.equal(email.body.data?.user.email ?? user.email, user.email);
  });

  it('changes the password and logs out the other devices only', async () => {
    const user = await testApp.registerAndLogin();
    const otherDevice = await testApp.loginUser({ email: user.email });

    const response = await send('POST', '/api/me/password', user.accessToken, {
      currentPassword: TEST_PASSWORD,
      newPassword: 'brand-new-secret',
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.loggedOutCount, 1);
    assert.equal(
      (await send('GET', '/api/auth/me', user.accessToken)).statusCode,
      200,
    );
    assert.equal(
      (await send('GET', '/api/auth/me', otherDevice.accessToken)).statusCode,
      401,
    );

    const oldLogin = await send('POST', '/api/auth/login', undefined, {
      email: user.email,
      password: TEST_PASSWORD,
    });
    const newLogin = await send('POST', '/api/auth/login', undefined, {
      email: user.email,
      password: 'brand-new-secret',
    });

    assert.equal(oldLogin.statusCode, 401);
    assert.equal(newLogin.statusCode, 200);
  });

  it('rejects a wrong current password and the same password again', async () => {
    const user = await testApp.registerAndLogin();

    const wrong = await send('POST', '/api/me/password', user.accessToken, {
      currentPassword: 'not-my-password',
      newPassword: 'brand-new-secret',
    });
    const same = await send('POST', '/api/me/password', user.accessToken, {
      currentPassword: TEST_PASSWORD,
      newPassword: TEST_PASSWORD,
    });
    const short = await send('POST', '/api/me/password', user.accessToken, {
      currentPassword: TEST_PASSWORD,
      newPassword: 'abc',
    });

    assert.equal(wrong.statusCode, 400);
    assert.equal(same.statusCode, 400);
    assert.equal(short.statusCode, 400);
  });
});
