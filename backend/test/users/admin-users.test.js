import { randomUUID } from 'node:crypto';
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';

const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

describe('admin users list and detail', () => {
  let testApp;
  let admin;
  let firstUser;
  let secondUser;
  const nameTag = `Users${randomUUID().slice(0, 8)}`;

  before(async () => {
    testApp = await buildTestApp();
    admin = await testApp.registerAndLoginAsAdmin();

    await testApp.registerUser({ name: `${nameTag} First` });
    await testApp.registerUser({ name: `${nameTag} Second` });

    const [first, second] = await testApp.runSql(
      'SELECT id, email FROM users WHERE name LIKE $1 ORDER BY name',
      [`${nameTag}%`],
    );
    firstUser = first;
    secondUser = second;
  });

  after(async () => {
    await testApp.close();
  });

  function send(url, accessToken = admin.accessToken) {
    return testApp.sendRequest({ method: 'GET', url, accessToken });
  }

  describe('GET /api/admin/users', () => {
    it('lists users with balance, last login and pagination meta', async () => {
      const response = await send(`/api/admin/users?search=${nameTag}`);

      assert.equal(response.statusCode, 200);
      assert.equal(response.body.data.users.length, 2);
      assert.deepEqual(response.body.meta, {
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });

      const [user] = response.body.data.users;
      assert.equal(typeof user.balance, 'number');
      assert.ok('lastLoginAt' in user);
      assert.equal(user.passwordHash, undefined);
    });

    it('shows the newest users first', async () => {
      const response = await send(`/api/admin/users?search=${nameTag}`);
      const names = response.body.data.users.map((user) => user.name);

      assert.deepEqual(names, [`${nameTag} Second`, `${nameTag} First`]);
    });

    it('searches by email too', async () => {
      const response = await send(
        `/api/admin/users?search=${encodeURIComponent(firstUser.email)}`,
      );

      assert.equal(response.body.data.users.length, 1);
      assert.equal(response.body.data.users[0].id, firstUser.id);
    });

    it('treats % in the search as plain text', async () => {
      const response = await send(`/api/admin/users?search=${nameTag}%25`);

      assert.equal(response.statusCode, 200);
      assert.equal(response.body.data.users.length, 0);
    });

    it('filters by role and status', async () => {
      await testApp.runSql(
        "UPDATE users SET status = 'suspended' WHERE id = $1",
        [secondUser.id],
      );

      const suspended = await send(
        `/api/admin/users?search=${nameTag}&status=suspended`,
      );
      assert.deepEqual(
        suspended.body.data.users.map((user) => user.id),
        [secondUser.id],
      );

      const admins = await send(
        `/api/admin/users?search=${nameTag}&role=admin`,
      );
      assert.equal(admins.body.data.users.length, 0);

      await testApp.runSql("UPDATE users SET status = 'active' WHERE id = $1", [
        secondUser.id,
      ]);
    });

    it('pages through the results', async () => {
      const response = await send(
        `/api/admin/users?search=${nameTag}&page=2&limit=1`,
      );

      assert.equal(response.body.data.users.length, 1);
      assert.equal(response.body.data.users[0].id, firstUser.id);
      assert.equal(response.body.meta.totalPages, 2);
    });

    it('rejects an unknown filter value', async () => {
      const response = await send('/api/admin/users?role=owner');

      assert.equal(response.statusCode, 400);
    });

    it('is only for admins', async () => {
      const user = await testApp.registerAndLogin();
      const response = await send('/api/admin/users', user.accessToken);

      assert.equal(response.statusCode, 403);
    });
  });

  describe('GET /api/admin/users/:userId', () => {
    it('returns the user with balance and active session count', async () => {
      await testApp.loginUser({ email: firstUser.email });

      const response = await send(`/api/admin/users/${firstUser.id}`);

      assert.equal(response.statusCode, 200);
      const { user } = response.body.data;
      assert.equal(user.id, firstUser.id);
      assert.equal(user.email, firstUser.email);
      assert.equal(typeof user.balance, 'number');
      assert.equal(user.activeSessionCount, 1);
      assert.equal(user.passwordHash, undefined);
    });

    it('returns 404 for an unknown user', async () => {
      const response = await send(`/api/admin/users/${UNKNOWN_ID}`);

      assert.equal(response.statusCode, 404);
      assert.equal(response.body.message, 'User not found');
    });

    it('rejects an id that is not a uuid', async () => {
      const response = await send('/api/admin/users/not-a-uuid');

      assert.equal(response.statusCode, 400);
    });
  });
});
