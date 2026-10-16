import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';

const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

describe('image library', () => {
  let testApp;

  before(async () => {
    testApp = await buildTestApp();
  });

  after(async () => {
    await testApp.close();
  });

  async function upload(user, fileName = 'photo.png') {
    const boundary = 'library-boundary';
    const payload = Buffer.concat([
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: image/png\r\n\r\n`,
      ),
      PNG_1X1,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);
    const response = await testApp.app.inject({
      method: 'POST',
      url: '/api/images',
      payload,
      headers: {
        authorization: `Bearer ${user.accessToken}`,
        'content-type': `multipart/form-data; boundary=${boundary}`,
      },
    });

    return response.json().data.image;
  }

  function send(user, method, url, payload) {
    return testApp.sendRequest({
      method,
      url,
      payload,
      accessToken: user.accessToken,
    });
  }

  async function listIds(user, query = '') {
    const response = await send(user, 'GET', `/api/images${query}`);

    return response.body.data.images.map((image) => image.id);
  }

  describe('GET /api/images filters', () => {
    it('searches the file name and filters by favorite, source and date', async () => {
      const user = await testApp.registerAndLogin();
      const beach = await upload(user, 'beach-day.png');
      const forest = await upload(user, 'forest-walk.png');
      await send(user, 'PATCH', `/api/images/${forest.id}`, {
        isFavorite: true,
      });
      await testApp.runSql(
        "UPDATE images SET created_at = now() - interval '40 days' WHERE id = $1",
        [beach.id],
      );

      assert.deepEqual(await listIds(user, '?search=beach'), [beach.id]);
      assert.deepEqual(await listIds(user, '?favorite=true'), [forest.id]);
      assert.deepEqual(await listIds(user, '?since=30d'), [forest.id]);
      assert.deepEqual(await listIds(user, '?source=generated'), []);
      assert.equal((await listIds(user, '?source=upload')).length, 2);
    });

    it('returns no prompt or model for uploaded images', async () => {
      const user = await testApp.registerAndLogin();
      await upload(user);

      const response = await send(user, 'GET', '/api/images');
      const [image] = response.body.data.images;

      assert.equal(image.prompt, null);
      assert.equal(image.model, null);
      assert.ok(image.thumbnailUrl.includes('/thumbnails/'));
    });

    it('rejects an unknown date filter', async () => {
      const user = await testApp.registerAndLogin();

      const response = await send(user, 'GET', '/api/images?since=1y');

      assert.equal(response.statusCode, 400);
    });
  });

  describe('PATCH /api/images/:id', () => {
    it('adds and removes a favorite', async () => {
      const user = await testApp.registerAndLogin();
      const image = await upload(user);

      const added = await send(user, 'PATCH', `/api/images/${image.id}`, {
        isFavorite: true,
      });
      const removed = await send(user, 'PATCH', `/api/images/${image.id}`, {
        isFavorite: false,
      });

      assert.equal(added.statusCode, 200);
      assert.equal(added.body.data.image.isFavorite, true);
      assert.equal(added.body.message, 'Added to favorites');
      assert.equal(removed.body.data.image.isFavorite, false);
    });

    it('does not touch another user image', async () => {
      const owner = await testApp.registerAndLogin();
      const other = await testApp.registerAndLogin();
      const image = await upload(owner);

      const response = await send(other, 'PATCH', `/api/images/${image.id}`, {
        isFavorite: true,
      });

      assert.equal(response.statusCode, 404);
    });
  });

  describe('bulk actions', () => {
    it('favorites only my images from the list', async () => {
      const owner = await testApp.registerAndLogin();
      const other = await testApp.registerAndLogin();
      const mine = await upload(owner);
      const theirs = await upload(other);

      const response = await send(owner, 'POST', '/api/images/bulk-favorite', {
        ids: [mine.id, theirs.id, UNKNOWN_ID],
        isFavorite: true,
      });

      assert.equal(response.statusCode, 200);
      assert.deepEqual(response.body.data.updatedIds, [mine.id]);
      assert.deepEqual(await listIds(other, '?favorite=true'), []);
    });

    it('deletes only my images and their files', async () => {
      const owner = await testApp.registerAndLogin();
      const other = await testApp.registerAndLogin();
      const first = await upload(owner);
      const second = await upload(owner);
      const theirs = await upload(other);

      const response = await send(owner, 'POST', '/api/images/bulk-delete', {
        ids: [first.id, second.id, theirs.id],
      });

      assert.equal(response.statusCode, 200);
      assert.equal(response.body.message, '2 images deleted');
      assert.deepEqual(
        response.body.data.deletedIds.sort(),
        [first.id, second.id].sort(),
      );
      assert.deepEqual(await listIds(owner), []);
      assert.deepEqual(await listIds(other), [theirs.id]);

      const ownerFiles = [...testApp.storage.files.keys()].filter((key) =>
        key.startsWith(`users/${owner.user.id}/`),
      );
      assert.deepEqual(ownerFiles, []);
    });

    it('rejects an empty or too long id list', async () => {
      const user = await testApp.registerAndLogin();
      const tooMany = Array.from(
        { length: 101 },
        (_, index) =>
          `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
      );

      const empty = await send(user, 'POST', '/api/images/bulk-delete', {
        ids: [],
      });
      const long = await send(user, 'POST', '/api/images/bulk-delete', {
        ids: tooMany,
      });

      assert.equal(empty.statusCode, 400);
      assert.equal(long.statusCode, 400);
    });
  });

  describe('GET /api/images/:id/download', () => {
    it('returns a download link with the file name', async () => {
      const user = await testApp.registerAndLogin();
      const image = await upload(user, 'sunset.png');

      const response = await send(
        user,
        'GET',
        `/api/images/${image.id}/download`,
      );

      assert.equal(response.statusCode, 200);
      assert.ok(response.body.data.url.includes('download=sunset.png'));
    });

    it('hides another user image', async () => {
      const owner = await testApp.registerAndLogin();
      const other = await testApp.registerAndLogin();
      const image = await upload(owner);

      const response = await send(
        other,
        'GET',
        `/api/images/${image.id}/download`,
      );

      assert.equal(response.statusCode, 404);
    });
  });
});
