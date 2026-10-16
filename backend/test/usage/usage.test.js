import { randomUUID } from 'node:crypto';
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { buildTestApp } from '../helpers/test-app.js';

describe('usage API', () => {
  let testApp;
  let admin;
  let model;
  let workflowIds;
  let user;

  before(async () => {
    testApp = await buildTestApp();
    admin = await testApp.registerAndLoginAsAdmin();

    const [provider] = await testApp.runSql(
      'SELECT id FROM ai_providers ORDER BY created_at LIMIT 1',
    );
    const created = await adminSend('POST', '/api/admin/models', {
      providerId: provider.id,
      name: `Usage Model ${randomUUID().slice(0, 4)}`,
      slug: `usage-model-${randomUUID().slice(0, 8)}`,
      providerModelId: `usage-${randomUUID().slice(0, 8)}`,
    });
    model = created.body.data.model;

    const types = await testApp.runSql(
      "SELECT id, code FROM generation_types WHERE code IN ('text_to_image', 'image_edit')",
    );

    for (const type of types) {
      await adminSend(
        'PUT',
        `/api/admin/models/${model.id}/workflows/${type.id}`,
        {
          isEnabled: true,
          enabledOptions: {
            sizes: ['1024x1024'],
            qualities: ['low'],
            outputFormats: ['png'],
            maxImagesPerRequest: 2,
          },
          defaultOptions: {
            size: '1024x1024',
            quality: 'low',
            outputFormat: 'png',
            n: 1,
          },
        },
      );
    }

    const workflows = await testApp.runSql(
      'SELECT mw.id, gt.code FROM model_workflows mw JOIN generation_types gt ON gt.id = mw.generation_type_id WHERE mw.model_id = $1',
      [model.id],
    );
    workflowIds = Object.fromEntries(
      workflows.map((workflow) => [workflow.code, workflow.id]),
    );

    user = await testApp.registerAndLogin();

    await addGeneration({
      code: 'text_to_image',
      n: 2,
      credits: 4,
      createdAt: '2026-03-10T12:00:00Z',
    });
    await addGeneration({
      code: 'image_edit',
      n: 1,
      credits: 3,
      createdAt: '2026-03-31T20:00:00Z',
    });
    await addGeneration({
      code: 'text_to_image',
      n: 1,
      credits: 9,
      status: 'failed',
      createdAt: '2026-03-11T12:00:00Z',
    });
    await addGeneration({
      code: 'text_to_image',
      n: 1,
      credits: 5,
      createdAt: '2026-02-14T12:00:00Z',
    });

    const content = await sharp({
      create: { width: 4, height: 4, channels: 3, background: '#ff0000' },
    })
      .png()
      .toBuffer();
    const image = await testApp.uploadImage({
      accessToken: user.accessToken,
      content,
    });
    await testApp.runSql(
      "INSERT INTO image_analyses (user_id, image_id, task, status, credits, model, created_at) VALUES ($1, $2, 'describe', 'succeeded', 2, 'gpt-4.1-mini', '2026-03-15T09:00:00Z')",
      [user.user.id, image.id],
    );

    const [wallet] = await testApp.runSql(
      'SELECT id, balance FROM credit_wallets WHERE user_id = $1',
      [user.user.id],
    );
    await testApp.runSql(
      "INSERT INTO credit_transactions (wallet_id, amount, balance_after, type, created_at) VALUES ($1, 9, $2, 'generation_refund', '2026-03-11T12:01:00Z')",
      [wallet.id, wallet.balance],
    );
  });

  after(async () => {
    await testApp.runSql('DELETE FROM generations WHERE model_id = $1', [
      model.id,
    ]);
    await testApp.runSql('DELETE FROM ai_models WHERE id = $1', [model.id]);
    await testApp.close();
  });

  function adminSend(method, url, payload) {
    return testApp.sendRequest({
      method,
      url,
      payload,
      accessToken: admin.accessToken,
    });
  }

  function addGeneration({
    code,
    n,
    credits,
    status = 'succeeded',
    createdAt,
  }) {
    return testApp.runSql(
      'INSERT INTO generations (user_id, model_id, model_workflow_id, prompt, options, status, credits_per_image, total_credits, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [
        user.user.id,
        model.id,
        workflowIds[code],
        'a usage test prompt',
        JSON.stringify({
          size: '1024x1024',
          quality: 'low',
          outputFormat: 'png',
          n,
        }),
        status,
        credits / n,
        credits,
        createdAt,
      ],
    );
  }

  function readUsage(query, accessToken = user.accessToken) {
    return testApp.sendRequest({
      method: 'GET',
      url: `/api/usage${query}`,
      accessToken,
    });
  }

  it('requires login', async () => {
    const response = await testApp.sendRequest({
      method: 'GET',
      url: '/api/usage',
    });

    assert.equal(response.statusCode, 401);
  });

  it('sums a month in the user timezone and compares it with the month before', async () => {
    const response = await readUsage('?month=2026-03&timezone=Asia/Karachi');
    const usage = response.body.data;

    assert.equal(response.statusCode, 200);
    assert.equal(usage.month, '2026-03');
    assert.equal(usage.creditsUsed, 6);
    assert.equal(usage.imagesGenerated, 2);
    assert.equal(usage.previousCreditsUsed, 5);
    assert.equal(usage.previousImagesGenerated, 1);
    assert.equal(usage.averageCreditsPerImage, 2);
    assert.equal(usage.creditsRefunded, 9);
    assert.equal(usage.refunds, 1);
    assert.deepEqual(
      usage.features.map((feature) => [
        feature.code,
        feature.credits,
        feature.runs,
      ]),
      [
        ['text_to_image', 4, 1],
        ['image_to_image', 0, 0],
        ['image_edit', 0, 0],
        ['vision', 2, 1],
      ],
    );
    assert.equal(usage.days.length, 31);
    assert.deepEqual(
      usage.days.find((day) => day.date === '2026-03-10'),
      { date: '2026-03-10', credits: 4, images: 2 },
    );
    assert.equal(
      usage.days.find((day) => day.date === '2026-03-15').credits,
      2,
    );
  });

  it('puts a late evening run in the next month for a timezone ahead of UTC', async () => {
    const utc = (await readUsage('?month=2026-03&timezone=UTC')).body.data;
    const april = (await readUsage('?month=2026-04&timezone=Asia/Karachi')).body
      .data;

    assert.equal(utc.creditsUsed, 9);
    assert.equal(utc.days.at(-1).credits, 3);
    assert.equal(april.creditsUsed, 3);
    assert.equal(april.previousCreditsUsed, 6);
    assert.equal(april.days[0].credits, 3);
  });

  it('shows only the logged in user usage', async () => {
    const other = await testApp.registerAndLogin();
    const response = await readUsage('?month=2026-03', other.accessToken);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.creditsUsed, 0);
    assert.equal(response.body.data.creditsRefunded, 0);
    assert.equal(response.body.data.averageCreditsPerImage, null);
  });

  it('defaults to the current month', async () => {
    const response = await readUsage('');
    const usage = response.body.data;

    assert.equal(response.statusCode, 200);
    assert.equal(usage.timezone, 'UTC');
    assert.match(usage.month, /^\d{4}-\d{2}$/);
    assert.ok(usage.today.startsWith(usage.month));
    assert.ok(usage.days.some((day) => day.date === usage.today));
  });

  it('rejects an unknown timezone and a bad month', async () => {
    const timezone = await readUsage('?timezone=Mars/Base');
    const month = await readUsage('?month=2026-13');

    assert.equal(timezone.statusCode, 400);
    assert.equal(month.statusCode, 400);
  });
});
