import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';

const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

const WEBP_1X1 = Buffer.from(
  'UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==',
  'base64',
);

function buildMultipartBody({ fileName, contentType, content }) {
  const boundary = 'test-boundary-123';
  const head = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: ${contentType}\r\n\r\n`,
  );
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`);

  return {
    payload: Buffer.concat([head, content, tail]),
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
}

describe('images', () => {
  let testApp;
  let user;
  let otherUser;

  before(async () => {
    testApp = await buildTestApp();
    user = await testApp.registerAndLogin();
    otherUser = await testApp.registerAndLogin();
  });

  after(async () => {
    await testApp.close();
  });

  async function upload({
    fileName = 'photo.png',
    contentType = 'image/png',
    content = PNG_1X1,
    accessToken = user.accessToken,
  } = {}) {
    const body = buildMultipartBody({ fileName, contentType, content });
    const response = await testApp.app.inject({
      method: 'POST',
      url: '/api/images',
      payload: body.payload,
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': body.contentType,
      },
    });

    return { statusCode: response.statusCode, body: response.json() };
  }

  function send(method, url, accessToken = user.accessToken) {
    return testApp.sendRequest({ method, url, accessToken });
  }

  describe('POST /api/images', () => {
    it('uploads a PNG into the user uploads folder', async () => {
      const response = await upload();

      assert.equal(response.statusCode, 201);
      const { image } = response.body.data;
      assert.equal(image.source, 'upload');
      assert.equal(image.contentType, 'image/png');
      assert.equal(image.width, 1);
      assert.equal(image.height, 1);
      assert.equal(image.sizeBytes, PNG_1X1.length);
      assert.equal(image.originalFileName, 'photo.png');
      assert.equal(image.storageKey, undefined);

      const key = `users/${user.user.id}/uploads/${image.id}.png`;
      assert.ok(testApp.storage.files.has(key));
      assert.ok(image.url.includes(key));
    });

    it('uploads a WebP with the webp extension', async () => {
      const response = await upload({
        fileName: 'photo.webp',
        contentType: 'image/webp',
        content: WEBP_1X1,
      });

      assert.equal(response.statusCode, 201);
      const { image } = response.body.data;
      assert.equal(image.contentType, 'image/webp');
      assert.ok(
        testApp.storage.files.has(
          `users/${user.user.id}/uploads/${image.id}.webp`,
        ),
      );
    });

    it('checks the file content, not the name or type sent', async () => {
      const response = await upload({
        fileName: 'fake.png',
        contentType: 'image/png',
        content: Buffer.from('this is plain text, not an image'),
      });

      assert.equal(response.statusCode, 400);
      assert.equal(response.body.message, 'Use a PNG, JPG or WebP image');
    });

    it('rejects a file over 25 MB', async () => {
      const content = Buffer.concat([PNG_1X1, Buffer.alloc(25 * 1024 * 1024)]);

      const response = await upload({ content });

      assert.equal(response.statusCode, 413);
      assert.equal(response.body.code, 'PAYLOAD_TOO_LARGE');
      assert.equal(response.body.message, 'Use an image under 25 MB');
    });

    it('rejects a request without a file', async () => {
      const boundary = 'empty-boundary';
      const response = await testApp.app.inject({
        method: 'POST',
        url: '/api/images',
        payload: `--${boundary}--\r\n`,
        headers: {
          authorization: `Bearer ${user.accessToken}`,
          'content-type': `multipart/form-data; boundary=${boundary}`,
        },
      });

      assert.equal(response.statusCode, 400);
      assert.equal(response.json().message, 'Choose an image to upload');
    });

    it('needs a logged in user', async () => {
      const response = await upload({ accessToken: 'not-a-token' });

      assert.equal(response.statusCode, 401);
    });
  });

  describe('GET /api/images', () => {
    it('lists only my images, newest first, with urls', async () => {
      await upload({ accessToken: otherUser.accessToken });

      const response = await send('GET', '/api/images');

      assert.equal(response.statusCode, 200);
      const { images } = response.body.data;
      assert.equal(images.length, 2);
      assert.equal(images[0].contentType, 'image/webp');
      assert.ok(images.every((image) => image.url));
      assert.equal(response.body.meta.total, 2);
    });

    it('filters by source', async () => {
      const response = await send('GET', '/api/images?source=generated');

      assert.equal(response.body.data.images.length, 0);
    });
  });

  describe('GET and DELETE /api/images/:id', () => {
    it('returns my image', async () => {
      const uploaded = await upload();
      const { id } = uploaded.body.data.image;

      const response = await send('GET', `/api/images/${id}`);

      assert.equal(response.statusCode, 200);
      assert.equal(response.body.data.image.id, id);
    });

    it('hides other users images', async () => {
      const uploaded = await upload();
      const { id } = uploaded.body.data.image;

      const read = await send(
        'GET',
        `/api/images/${id}`,
        otherUser.accessToken,
      );
      assert.equal(read.statusCode, 404);

      const removed = await send(
        'DELETE',
        `/api/images/${id}`,
        otherUser.accessToken,
      );
      assert.equal(removed.statusCode, 404);
    });

    it('deletes the row and the stored file', async () => {
      const uploaded = await upload();
      const { id } = uploaded.body.data.image;
      const key = `users/${user.user.id}/uploads/${id}.png`;

      const response = await send('DELETE', `/api/images/${id}`);

      assert.equal(response.statusCode, 200);
      assert.equal(response.body.message, 'Image deleted');
      assert.equal(testApp.storage.files.has(key), false);

      const read = await send('GET', `/api/images/${id}`);
      assert.equal(read.statusCode, 404);
    });

    it('returns 404 for an unknown image', async () => {
      const response = await send('DELETE', `/api/images/${UNKNOWN_ID}`);

      assert.equal(response.statusCode, 404);
      assert.equal(response.body.message, 'Image not found');
    });
  });
});
