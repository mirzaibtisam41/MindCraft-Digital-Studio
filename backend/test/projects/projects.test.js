import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';

const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

describe('projects', () => {
  let testApp;

  before(async () => {
    testApp = await buildTestApp();
  });

  after(async () => {
    await testApp.close();
  });

  function send(user, method, url, payload) {
    return testApp.sendRequest({
      method,
      url,
      payload,
      accessToken: user.accessToken,
    });
  }

  async function upload(user) {
    const boundary = 'project-boundary';
    const response = await testApp.app.inject({
      method: 'POST',
      url: '/api/images',
      payload: Buffer.concat([
        Buffer.from(
          `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="shot.png"\r\nContent-Type: image/png\r\n\r\n`,
        ),
        PNG_1X1,
        Buffer.from(`\r\n--${boundary}--\r\n`),
      ]),
      headers: {
        authorization: `Bearer ${user.accessToken}`,
        'content-type': `multipart/form-data; boundary=${boundary}`,
      },
    });

    return response.json().data.image;
  }

  async function createProject(user, name = 'Spring campaign') {
    const response = await send(user, 'POST', '/api/projects', {
      name: `  ${name}  `,
      description: 'Hero images for the launch',
    });

    return response.body.data.project;
  }

  describe('create, list, update and delete', () => {
    it('creates a project and lists it with counts and previews', async () => {
      const user = await testApp.registerAndLogin();
      const project = await createProject(user);
      const image = await upload(user);
      await send(user, 'POST', `/api/projects/${project.id}/images`, {
        imageIds: [image.id],
      });

      const list = await send(user, 'GET', '/api/projects?search=spring');

      assert.equal(project.name, 'Spring campaign');
      assert.equal(list.statusCode, 200);
      const [listed] = list.body.data.projects;
      assert.equal(listed.id, project.id);
      assert.equal(listed.imageCount, 1);
      assert.equal(listed.collectionCount, 0);
      assert.equal(listed.previewImages.length, 1);
      assert.ok(listed.previewImages[0].thumbnailUrl.includes('/thumbnails/'));
      assert.equal(list.body.meta.total, 1);
    });

    it('renames, sets a cover and clears it when the image leaves', async () => {
      const user = await testApp.registerAndLogin();
      const project = await createProject(user);
      const image = await upload(user);
      await send(user, 'POST', `/api/projects/${project.id}/images`, {
        imageIds: [image.id],
      });

      const updated = await send(user, 'PATCH', `/api/projects/${project.id}`, {
        name: 'Summer campaign',
        coverImageId: image.id,
      });
      await send(user, 'POST', `/api/projects/${project.id}/images/remove`, {
        imageIds: [image.id],
      });
      const detail = await send(user, 'GET', `/api/projects/${project.id}`);

      assert.equal(updated.statusCode, 200);
      assert.equal(updated.body.data.project.name, 'Summer campaign');
      assert.equal(updated.body.data.project.coverImageId, image.id);
      assert.equal(detail.body.data.project.coverImageId, null);
      assert.equal(detail.body.data.project.imageCount, 0);
    });

    it('only accepts a cover that is in the project', async () => {
      const user = await testApp.registerAndLogin();
      const project = await createProject(user);
      const image = await upload(user);

      const response = await send(
        user,
        'PATCH',
        `/api/projects/${project.id}`,
        {
          coverImageId: image.id,
        },
      );

      assert.equal(response.statusCode, 400);
      assert.equal(
        response.body.message,
        'The cover must be an image in this project',
      );
    });

    it('deletes the project but keeps the images', async () => {
      const user = await testApp.registerAndLogin();
      const project = await createProject(user);
      const image = await upload(user);
      await send(user, 'POST', `/api/projects/${project.id}/images`, {
        imageIds: [image.id],
      });

      const deleted = await send(user, 'DELETE', `/api/projects/${project.id}`);
      const read = await send(user, 'GET', `/api/projects/${project.id}`);
      const stillThere = await send(user, 'GET', `/api/images/${image.id}`);

      assert.equal(deleted.statusCode, 200);
      assert.equal(read.statusCode, 404);
      assert.equal(stillThere.statusCode, 200);
    });

    it('rejects a blank name and an empty update', async () => {
      const user = await testApp.registerAndLogin();
      const project = await createProject(user);

      const blank = await send(user, 'POST', '/api/projects', { name: '   ' });
      const empty = await send(
        user,
        'PATCH',
        `/api/projects/${project.id}`,
        {},
      );

      assert.equal(blank.statusCode, 400);
      assert.equal(empty.statusCode, 400);
    });
  });

  describe('images and collections', () => {
    it('adds images once, filters by collection and moves them', async () => {
      const user = await testApp.registerAndLogin();
      const project = await createProject(user);
      const first = await upload(user);
      const second = await upload(user);

      const collection = await send(
        user,
        'POST',
        `/api/projects/${project.id}/collections`,
        { name: 'Hero shots' },
      );
      const collectionId = collection.body.data.collection.id;
      const added = await send(
        user,
        'POST',
        `/api/projects/${project.id}/images`,
        { imageIds: [first.id, second.id], collectionId },
      );
      const addedAgain = await send(
        user,
        'POST',
        `/api/projects/${project.id}/images`,
        { imageIds: [first.id] },
      );
      await send(
        user,
        'PATCH',
        `/api/projects/${project.id}/images/collection`,
        {
          imageIds: [second.id],
          collectionId: null,
        },
      );
      const inCollection = await send(
        user,
        'GET',
        `/api/projects/${project.id}/images?collectionId=${collectionId}`,
      );
      const all = await send(user, 'GET', `/api/projects/${project.id}/images`);
      const detail = await send(user, 'GET', `/api/projects/${project.id}`);

      assert.equal(collection.statusCode, 201);
      assert.equal(added.body.data.addedIds.length, 2);
      assert.deepEqual(addedAgain.body.data.addedIds, []);
      assert.deepEqual(
        inCollection.body.data.images.map((image) => image.id),
        [first.id],
      );
      assert.equal(all.body.meta.total, 2);
      assert.deepEqual(
        detail.body.data.project.collections.map((item) => [
          item.name,
          item.imageCount,
        ]),
        [['Hero shots', 1]],
      );
    });

    it('refuses images that belong to someone else', async () => {
      const owner = await testApp.registerAndLogin();
      const other = await testApp.registerAndLogin();
      const project = await createProject(owner);
      const theirs = await upload(other);

      const response = await send(
        owner,
        'POST',
        `/api/projects/${project.id}/images`,
        { imageIds: [theirs.id] },
      );

      assert.equal(response.statusCode, 404);
      assert.equal(
        response.body.message,
        'Some of these images were not found',
      );
    });

    it('keeps collection names unique and keeps images when a collection is deleted', async () => {
      const user = await testApp.registerAndLogin();
      const project = await createProject(user);
      const image = await upload(user);
      const collection = await send(
        user,
        'POST',
        `/api/projects/${project.id}/collections`,
        { name: 'Drafts' },
      );
      const collectionId = collection.body.data.collection.id;
      await send(user, 'POST', `/api/projects/${project.id}/images`, {
        imageIds: [image.id],
        collectionId,
      });

      const duplicate = await send(
        user,
        'POST',
        `/api/projects/${project.id}/collections`,
        { name: 'Drafts' },
      );
      const renamed = await send(
        user,
        'PATCH',
        `/api/projects/${project.id}/collections/${collectionId}`,
        { name: 'Finals' },
      );
      const deleted = await send(
        user,
        'DELETE',
        `/api/projects/${project.id}/collections/${collectionId}`,
      );
      const images = await send(
        user,
        'GET',
        `/api/projects/${project.id}/images`,
      );

      assert.equal(duplicate.statusCode, 409);
      assert.equal(renamed.body.data.collection.name, 'Finals');
      assert.equal(deleted.statusCode, 200);
      assert.equal(images.body.data.images[0].collectionId, null);
    });

    it('rejects a collection from another project', async () => {
      const user = await testApp.registerAndLogin();
      const project = await createProject(user, 'One');
      const otherProject = await createProject(user, 'Two');
      const image = await upload(user);
      const collection = await send(
        user,
        'POST',
        `/api/projects/${otherProject.id}/collections`,
        { name: 'Elsewhere' },
      );

      const response = await send(
        user,
        'POST',
        `/api/projects/${project.id}/images`,
        {
          imageIds: [image.id],
          collectionId: collection.body.data.collection.id,
        },
      );

      assert.equal(response.statusCode, 404);
      assert.equal(response.body.message, 'Collection not found');
    });
  });

  describe('ownership', () => {
    it('hides other users projects everywhere', async () => {
      const owner = await testApp.registerAndLogin();
      const other = await testApp.registerAndLogin();
      const project = await createProject(owner);
      const base = `/api/projects/${project.id}`;

      const responses = await Promise.all([
        send(other, 'GET', base),
        send(other, 'PATCH', base, { name: 'Taken' }),
        send(other, 'DELETE', base),
        send(other, 'GET', `${base}/images`),
        send(other, 'POST', `${base}/collections`, { name: 'Mine now' }),
      ]);
      const theirList = await send(other, 'GET', '/api/projects');

      assert.deepEqual(
        responses.map((response) => response.statusCode),
        [404, 404, 404, 404, 404],
      );
      assert.equal(theirList.body.data.projects.length, 0);
    });

    it('returns 404 for an unknown project', async () => {
      const user = await testApp.registerAndLogin();

      const response = await send(user, 'GET', `/api/projects/${UNKNOWN_ID}`);

      assert.equal(response.statusCode, 404);
      assert.equal(response.body.message, 'Project not found');
    });
  });
});
