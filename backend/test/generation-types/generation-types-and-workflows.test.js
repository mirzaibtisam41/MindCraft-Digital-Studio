import { randomUUID } from 'node:crypto';
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';

const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

const VALID_WORKFLOW = {
  isEnabled: true,
  enabledOptions: {
    sizes: ['1024x1024', '1024x1536'],
    qualities: ['medium', 'high'],
    outputFormats: ['png', 'webp'],
    maxImagesPerRequest: 2,
  },
  defaultOptions: {
    size: '1024x1024',
    quality: 'medium',
    outputFormat: 'png',
    n: 1,
  },
};

describe('generation types and model workflows', () => {
  let testApp;
  let admin;
  let savedTypes;
  let textToImage;
  let imageEdit;
  let model;
  let providerId;

  before(async () => {
    testApp = await buildTestApp();
    admin = await testApp.registerAndLoginAsAdmin();
    savedTypes = await testApp.runSql(
      'SELECT id, code, name, description, is_active FROM generation_types',
    );
    textToImage = savedTypes.find((type) => type.code === 'text_to_image');
    imageEdit = savedTypes.find((type) => type.code === 'image_edit');

    const provider = await send('POST', '/api/admin/providers', {
      code: `test-${randomUUID().slice(0, 8)}`,
      name: 'Test Provider',
    });
    providerId = provider.body.data.provider.id;

    const createdModel = await send('POST', '/api/admin/models', {
      providerId,
      name: 'Workflow Model',
      slug: `test-model-${randomUUID().slice(0, 8)}`,
      providerModelId: 'workflow-model',
    });
    model = createdModel.body.data.model;
  });

  after(async () => {
    for (const type of savedTypes) {
      await testApp.runSql(
        'UPDATE generation_types SET name = $1, description = $2, is_active = $3 WHERE id = $4',
        [type.name, type.description, type.is_active, type.id],
      );
    }
    await testApp.runSql('DELETE FROM ai_models WHERE provider_id = $1', [
      providerId,
    ]);
    await testApp.runSql('DELETE FROM ai_providers WHERE id = $1', [
      providerId,
    ]);
    await testApp.runSql('DELETE FROM generation_types WHERE code = ANY($1)', [
      createdTypeCodes,
    ]);
    await testApp.close();
  });

  const createdTypeCodes = [];

  function makeTypeCode() {
    const code = `test_${randomUUID().slice(0, 8)}`;
    createdTypeCodes.push(code);

    return code;
  }

  function createType(payload) {
    return send('POST', '/api/admin/generation-types', {
      code: makeTypeCode(),
      name: 'Test Type',
      ...payload,
    });
  }

  function send(method, url, payload, accessToken = admin.accessToken) {
    return testApp.sendRequest({ method, url, accessToken, payload });
  }

  function saveWorkflow(typeId, payload) {
    return send(
      'PUT',
      `/api/admin/models/${model.id}/workflows/${typeId}`,
      payload,
    );
  }

  describe('generation types', () => {
    it('lists the three seeded generation types', async () => {
      const response = await send('GET', '/api/admin/generation-types');
      const codes = response.body.data.generationTypes.map((type) => type.code);

      assert.equal(response.statusCode, 200);
      for (const code of ['text_to_image', 'image_edit', 'image_to_image']) {
        assert.ok(codes.includes(code));
      }
    });

    it('updates the name and description but not the code', async () => {
      const response = await send(
        'PATCH',
        `/api/admin/generation-types/${imageEdit.id}`,
        { name: '  Edit Images  ', description: '  ', code: 'changed' },
      );

      assert.equal(response.statusCode, 200);
      assert.equal(response.body.data.generationType.name, 'Edit Images');
      assert.equal(response.body.data.generationType.description, null);
      assert.equal(response.body.data.generationType.code, 'image_edit');
    });

    it('turns a generation type off and on', async () => {
      const url = `/api/admin/generation-types/${imageEdit.id}/status`;

      const off = await send('PATCH', url, { isActive: false });
      const on = await send('PATCH', url, { isActive: true });

      assert.equal(off.body.data.generationType.isActive, false);
      assert.equal(on.body.data.generationType.isActive, true);
    });

    it('returns 404 for an unknown generation type', async () => {
      const response = await send(
        'PATCH',
        `/api/admin/generation-types/${UNKNOWN_ID}`,
        { name: 'Nobody' },
      );

      assert.equal(response.statusCode, 404);
    });

    it('creates a generation type, on by default, with a lowercase code', async () => {
      const code = makeTypeCode();

      const response = await send('POST', '/api/admin/generation-types', {
        code: code.toUpperCase(),
        name: '  Upscaling  ',
        description: '  Make images larger  ',
      });
      const created = response.body.data.generationType;

      assert.equal(response.statusCode, 201);
      assert.equal(created.code, code);
      assert.equal(created.name, 'Upscaling');
      assert.equal(created.description, 'Make images larger');
      assert.equal(created.isActive, true);
    });

    it('rejects a duplicate code and invalid input', async () => {
      const duplicate = await createType({ code: 'text_to_image' });
      const invalid = await send('POST', '/api/admin/generation-types', {
        code: 'has spaces!',
      });

      assert.equal(duplicate.statusCode, 409);
      assert.equal(invalid.statusCode, 400);
    });

    it('deletes a generation type that no model uses', async () => {
      const created = await createType({ isActive: false });
      const id = created.body.data.generationType.id;

      const deleted = await send('DELETE', `/api/admin/generation-types/${id}`);
      const again = await send('DELETE', `/api/admin/generation-types/${id}`);

      assert.equal(created.body.data.generationType.isActive, false);
      assert.equal(deleted.statusCode, 200);
      assert.equal(again.statusCode, 404);
    });

    it('refuses to delete a generation type used by a model', async () => {
      const created = await createType();
      const id = created.body.data.generationType.id;
      await saveWorkflow(id, { isEnabled: false });

      const response = await send(
        'DELETE',
        `/api/admin/generation-types/${id}`,
      );

      assert.equal(response.statusCode, 409);
      assert.match(response.body.message, /used by models/);
    });
  });

  describe('model workflows', () => {
    it('lists every generation type for a model, all off at first', async () => {
      const response = await send(
        'GET',
        `/api/admin/models/${model.id}/workflows`,
      );
      const workflows = response.body.data.workflows;

      assert.equal(response.statusCode, 200);
      assert.ok(workflows.length >= 3);
      assert.ok(workflows.every((workflow) => workflow.isEnabled === false));
      assert.ok(
        workflows.every((workflow) => workflow.enabledOptions === null),
      );
      assert.deepEqual(response.body.data.availableOptions.qualities, [
        'low',
        'medium',
        'high',
      ]);
    });

    it('saves and enables a workflow with valid options', async () => {
      const response = await saveWorkflow(textToImage.id, VALID_WORKFLOW);
      const list = await send('GET', `/api/admin/models/${model.id}/workflows`);
      const saved = list.body.data.workflows.find(
        (workflow) => workflow.generationType.id === textToImage.id,
      );

      assert.equal(response.statusCode, 200);
      assert.equal(response.body.data.workflow.isEnabled, true);
      assert.deepEqual(saved.enabledOptions, VALID_WORKFLOW.enabledOptions);
      assert.deepEqual(saved.defaultOptions, VALID_WORKFLOW.defaultOptions);
    });

    it('updates the same workflow instead of creating a second one', async () => {
      await saveWorkflow(textToImage.id, {
        ...VALID_WORKFLOW,
        isEnabled: false,
      });

      const rows = await testApp.runSql(
        'SELECT is_enabled FROM model_workflows WHERE model_id = $1 AND generation_type_id = $2',
        [model.id, textToImage.id],
      );

      assert.equal(rows.length, 1);
      assert.equal(rows[0].is_enabled, false);
    });

    it('refuses to enable a workflow without options', async () => {
      const response = await saveWorkflow(imageEdit.id, { isEnabled: true });

      assert.equal(response.statusCode, 400);
      assert.match(response.body.message, /before enabling/);
    });

    it('saves a workflow as off without options', async () => {
      const response = await saveWorkflow(imageEdit.id, { isEnabled: false });

      assert.equal(response.statusCode, 200);
      assert.equal(response.body.data.workflow.enabledOptions, null);
    });

    it('requires enabled options and defaults together', async () => {
      const response = await saveWorkflow(imageEdit.id, {
        isEnabled: false,
        enabledOptions: VALID_WORKFLOW.enabledOptions,
      });

      assert.equal(response.statusCode, 400);
      assert.match(response.body.message, /together/);
    });

    it('rejects options that are not in the allowed list', async () => {
      const response = await saveWorkflow(imageEdit.id, {
        ...VALID_WORKFLOW,
        enabledOptions: {
          ...VALID_WORKFLOW.enabledOptions,
          sizes: ['4096x4096'],
          maxImagesPerRequest: 10,
        },
      });

      assert.equal(response.statusCode, 400);
      assert.equal(response.body.code, 'VALIDATION_ERROR');
    });

    it('rejects defaults that are outside the enabled options', async () => {
      const cases = [
        [{ size: '1536x1024' }, /default size/],
        [{ quality: 'low' }, /default quality/],
        [{ outputFormat: 'jpeg' }, /default output format/],
        [{ n: 3 }, /number of images/],
      ];

      for (const [change, message] of cases) {
        const response = await saveWorkflow(imageEdit.id, {
          ...VALID_WORKFLOW,
          defaultOptions: { ...VALID_WORKFLOW.defaultOptions, ...change },
        });

        assert.equal(response.statusCode, 400);
        assert.match(response.body.message, message);
      }
    });

    it('refuses to enable a workflow whose generation type is off', async () => {
      await send(
        'PATCH',
        `/api/admin/generation-types/${imageEdit.id}/status`,
        {
          isActive: false,
        },
      );

      const response = await saveWorkflow(imageEdit.id, VALID_WORKFLOW);

      await send(
        'PATCH',
        `/api/admin/generation-types/${imageEdit.id}/status`,
        {
          isActive: true,
        },
      );

      assert.equal(response.statusCode, 400);
      assert.match(response.body.message, /turned off/);
    });

    it('returns 404 for an unknown model or generation type', async () => {
      const unknownModel = await send(
        'PUT',
        `/api/admin/models/${UNKNOWN_ID}/workflows/${textToImage.id}`,
        VALID_WORKFLOW,
      );
      const unknownType = await saveWorkflow(UNKNOWN_ID, VALID_WORKFLOW);
      const unknownModelList = await send(
        'GET',
        `/api/admin/models/${UNKNOWN_ID}/workflows`,
      );

      assert.equal(unknownModel.statusCode, 404);
      assert.equal(unknownType.statusCode, 404);
      assert.equal(unknownModelList.statusCode, 404);
    });
  });

  it('allows only admins', async () => {
    const user = await testApp.registerAndLogin();

    const responses = await Promise.all([
      send('GET', '/api/admin/generation-types', undefined, user.accessToken),
      send(
        'POST',
        '/api/admin/generation-types',
        { code: makeTypeCode(), name: 'X' },
        user.accessToken,
      ),
      send(
        'DELETE',
        `/api/admin/generation-types/${imageEdit.id}`,
        undefined,
        user.accessToken,
      ),
      send(
        'PATCH',
        `/api/admin/generation-types/${imageEdit.id}/status`,
        { isActive: false },
        user.accessToken,
      ),
      send(
        'GET',
        `/api/admin/models/${model.id}/workflows`,
        undefined,
        user.accessToken,
      ),
      send(
        'PUT',
        `/api/admin/models/${model.id}/workflows/${textToImage.id}`,
        VALID_WORKFLOW,
        user.accessToken,
      ),
    ]);

    assert.deepEqual(
      responses.map((response) => response.statusCode),
      [403, 403, 403, 403, 403, 403],
    );
  });
});
