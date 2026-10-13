import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TEST_PASSWORD, buildTestApp } from '../helpers/test-app.js';

describe('POST /api/auth/register', () => {
  let testApp;

  before(async () => {
    testApp = await buildTestApp();
  });

  after(async () => {
    await testApp.close();
  });

  function register(payload) {
    return testApp.sendRequest({
      method: 'POST',
      url: '/api/auth/register',
      payload,
    });
  }

  it('creates a user with a normalized name and email', async () => {
    const email = testApp.makeEmail();

    const response = await register({
      name: '  Ali Khan  ',
      email: email.toUpperCase(),
      password: TEST_PASSWORD,
    });

    assert.equal(response.statusCode, 201);
    assert.equal(response.body.data.user.name, 'Ali Khan');
    assert.equal(response.body.data.user.email, email);
    assert.equal(response.body.data.user.role, 'user');
    assert.equal(response.body.data.user.status, 'active');
    assert.equal('passwordHash' in response.body.data.user, false);
  });

  it('stores the password as an argon2id hash', async () => {
    const email = await testApp.registerUser();

    const [user] = await testApp.runSql(
      'SELECT password_hash FROM users WHERE email = $1',
      [email],
    );

    assert.match(user.password_hash, /^\$argon2id\$/);
  });

  it('rejects an email that is already registered, in any letter case', async () => {
    const email = await testApp.registerUser();

    const response = await register({
      name: 'Someone Else',
      email: email.toUpperCase(),
      password: TEST_PASSWORD,
    });

    assert.equal(response.statusCode, 409);
    assert.equal(response.body.code, 'CONFLICT');
  });

  it('rejects invalid input', async () => {
    const response = await register({
      name: '   ',
      email: 'not-an-email',
      password: 'short',
    });

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.code, 'VALIDATION_ERROR');
  });

  it('ignores a role sent in the body', async () => {
    const response = await register({
      name: 'Sneaky',
      email: testApp.makeEmail(),
      password: TEST_PASSWORD,
      role: 'admin',
    });

    assert.equal(response.statusCode, 201);
    assert.equal(response.body.data.user.role, 'user');
  });
});
