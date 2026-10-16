import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';
import { ProviderError } from '#src/utils/index.js';

const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

describe('Prompt Studio', () => {
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

  function savePrompt(user, overrides = {}) {
    return send(user, 'POST', '/api/prompts', {
      title: 'Cozy cabin',
      text: 'a small wooden cabin in the snow',
      category: 'architecture',
      ...overrides,
    });
  }

  describe('POST /api/prompts/enhance', () => {
    it('keeps only the added phrases that appear in the enhanced prompt', async () => {
      const user = await testApp.registerAndLogin();
      testApp.promptEnhancer.nextResult = {
        enhancedPrompt:
          'a red fox in snow, Golden hour light, shallow depth of field',
        addedDescriptors: [
          'golden hour light',
          'shallow depth of field',
          'not in the prompt',
          'golden hour light',
        ],
      };

      const response = await send(user, 'POST', '/api/prompts/enhance', {
        prompt: '  a red fox in snow  ',
        style: 'Cinematic',
      });

      assert.equal(response.statusCode, 200);
      assert.equal(response.body.data.originalPrompt, 'a red fox in snow');
      assert.deepEqual(response.body.data.addedDescriptors, [
        'golden hour light',
        'shallow depth of field',
      ]);

      const call = testApp.promptEnhancer.calls.at(-1);
      assert.equal(call.prompt, 'a red fox in snow');
      assert.equal(call.style, 'Cinematic');
      assert.equal(call.temperature, 0.4);
      assert.equal(typeof call.model, 'string');
    });

    it('uses a higher temperature for another angle', async () => {
      const user = await testApp.registerAndLogin();

      await send(user, 'POST', '/api/prompts/enhance', {
        prompt: 'a lighthouse',
        anotherAngle: true,
      });

      assert.equal(testApp.promptEnhancer.calls.at(-1).temperature, 0.9);
    });

    it('rejects an unknown style and maps provider errors', async () => {
      const user = await testApp.registerAndLogin();
      testApp.promptEnhancer.nextError = new ProviderError({
        category: 'timeout',
      });

      const failed = await send(user, 'POST', '/api/prompts/enhance', {
        prompt: 'a lighthouse',
      });
      const badStyle = await send(user, 'POST', '/api/prompts/enhance', {
        prompt: 'a lighthouse',
        style: 'Vaporwave',
      });

      assert.equal(failed.statusCode, 503);
      assert.equal(failed.body.message.includes('refunded'), false);
      assert.equal(badStyle.statusCode, 400);
    });

    it('limits how often one address can enhance', async () => {
      const user = await testApp.registerAndLogin();
      const statuses = [];

      for (let index = 0; index < 21; index += 1) {
        const response = await testApp.app.inject({
          method: 'POST',
          url: '/api/prompts/enhance',
          remoteAddress: '10.99.99.99',
          headers: { authorization: `Bearer ${user.accessToken}` },
          payload: { prompt: 'a lighthouse' },
        });
        statuses.push(response.statusCode);
      }

      assert.equal(
        statuses.slice(0, 20).every((status) => status === 200),
        true,
      );
      assert.equal(statuses.at(-1), 429);
    });
  });

  describe('options', () => {
    it('lists styles, categories and templates with placeholders', async () => {
      const user = await testApp.registerAndLogin();

      const response = await send(user, 'GET', '/api/prompts/options');

      assert.ok(response.body.data.styles.includes('Cinematic'));
      assert.ok(response.body.data.categories.includes('product'));
      assert.ok(
        response.body.data.templates.every((template) =>
          /\[[A-Z ]+\]/.test(template.text),
        ),
      );
    });
  });

  describe('saved prompts', () => {
    it('saves, lists with category counts, filters and searches', async () => {
      const user = await testApp.registerAndLogin();
      await savePrompt(user);
      await savePrompt(user, {
        title: 'Perfume bottle',
        text: 'a glass perfume bottle on marble',
        category: 'product',
        style: 'Photorealistic',
      });

      const all = await send(user, 'GET', '/api/prompts');
      const products = await send(user, 'GET', '/api/prompts?category=product');
      const search = await send(user, 'GET', '/api/prompts?search=marble');

      assert.equal(all.body.data.prompts.length, 2);
      assert.equal(all.body.meta.categoryCounts.all, 2);
      assert.equal(all.body.meta.categoryCounts.product, 1);
      assert.equal(all.body.meta.categoryCounts.architecture, 1);
      assert.deepEqual(
        products.body.data.prompts.map((prompt) => prompt.title),
        ['Perfume bottle'],
      );
      assert.deepEqual(
        search.body.data.prompts.map((prompt) => prompt.title),
        ['Perfume bottle'],
      );
    });

    it('updates, counts uses and deletes a prompt', async () => {
      const user = await testApp.registerAndLogin();
      const saved = await savePrompt(user);
      const { id } = saved.body.data.prompt;

      const updated = await send(user, 'PATCH', `/api/prompts/${id}`, {
        title: 'Cabin at night',
        style: 'Cinematic',
      });
      await send(user, 'POST', `/api/prompts/${id}/use`);
      const used = await send(user, 'POST', `/api/prompts/${id}/use`);
      const removed = await send(user, 'DELETE', `/api/prompts/${id}`);
      const after = await send(user, 'GET', '/api/prompts');

      assert.equal(saved.statusCode, 201);
      assert.equal(updated.body.data.prompt.title, 'Cabin at night');
      assert.equal(updated.body.data.prompt.style, 'Cinematic');
      assert.equal(used.body.data.prompt.usageCount, 2);
      assert.ok(used.body.data.prompt.lastUsedAt);
      assert.equal(removed.statusCode, 200);
      assert.equal(after.body.data.prompts.length, 0);
    });

    it('rejects bad input and hides other users prompts', async () => {
      const owner = await testApp.registerAndLogin();
      const other = await testApp.registerAndLogin();
      const saved = await savePrompt(owner);
      const { id } = saved.body.data.prompt;

      const badCategory = await savePrompt(owner, { category: 'food' });
      const blankTitle = await savePrompt(owner, { title: '   ' });
      const responses = await Promise.all([
        send(other, 'PATCH', `/api/prompts/${id}`, { title: 'Mine' }),
        send(other, 'DELETE', `/api/prompts/${id}`),
        send(other, 'POST', `/api/prompts/${id}/use`),
        send(owner, 'DELETE', `/api/prompts/${UNKNOWN_ID}`),
      ]);
      const theirList = await send(other, 'GET', '/api/prompts');

      assert.equal(badCategory.statusCode, 400);
      assert.equal(blankTitle.statusCode, 400);
      assert.deepEqual(
        responses.map((response) => response.statusCode),
        [404, 404, 404, 404],
      );
      assert.equal(theirList.body.data.prompts.length, 0);
    });
  });
});
