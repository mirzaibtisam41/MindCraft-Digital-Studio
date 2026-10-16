import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { buildTestApp } from '../helpers/test-app.js';
import { ProviderError } from '#src/utils/index.js';
import {
  refundStuckImageAnalysesService,
  startImageAnalysisService,
} from '#src/modules/image-analyses/shared/services/index.js';

const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

describe('AI Vision', () => {
  let testApp;
  let redImage;

  before(async () => {
    testApp = await buildTestApp();
    redImage = await sharp({
      create: {
        width: 4,
        height: 4,
        channels: 3,
        background: { r: 255, g: 0, b: 0 },
      },
    })
      .png()
      .toBuffer();
  });

  after(async () => {
    await testApp.close();
  });

  async function userWithImage(balance = 10) {
    const user = await testApp.registerAndLogin();
    await testApp.runSql(
      'UPDATE credit_wallets SET balance = $2 WHERE user_id = $1',
      [user.user.id, balance],
    );
    const image = await testApp.uploadImage({
      accessToken: user.accessToken,
      content: redImage,
    });

    return { user, image };
  }

  function analyze(user, payload) {
    return testApp.sendRequest({
      method: 'POST',
      url: '/api/vision/analyses',
      accessToken: user.accessToken,
      payload,
    });
  }

  async function readBalance(userId) {
    const [wallet] = await testApp.runSql(
      'SELECT balance FROM credit_wallets WHERE user_id = $1',
      [userId],
    );

    return wallet.balance;
  }

  it('lists the vision model, price and tasks', async () => {
    const { user } = await userWithImage();

    const response = await testApp.sendRequest({
      method: 'GET',
      url: '/api/vision/options',
      accessToken: user.accessToken,
    });

    assert.equal(response.statusCode, 200);
    assert.equal(typeof response.body.data.model, 'string');
    assert.equal(typeof response.body.data.creditsPerAnalysis, 'number');
    assert.ok(response.body.data.tasks.includes('ocr'));
  });

  it('describes an image, adds the real palette and charges the price', async () => {
    const { user, image } = await userWithImage();
    const [setting] = await testApp.runSql(
      "SELECT value FROM platform_settings WHERE key = 'vision_credits'",
    );
    testApp.vision.nextResult = {
      summary: 'A red square',
      details: 'A plain red square.',
      tags: ['red'],
    };

    const response = await analyze(user, {
      imageId: image.id,
      task: 'describe',
    });

    assert.equal(response.statusCode, 201);
    const { analysis } = response.body.data;
    assert.equal(analysis.status, 'succeeded');
    assert.equal(analysis.result.summary, 'A red square');
    assert.deepEqual(analysis.result.palette, [{ hex: '#ff0000', share: 100 }]);
    assert.equal(analysis.userId, undefined);

    const call = testApp.vision.calls.at(-1);
    assert.equal(call.task, 'describe');
    assert.deepEqual(call.image.buffer, redImage);
    assert.equal(call.image.contentType, 'image/png');
    assert.equal(await readBalance(user.user.id), 10 - setting.value);
  });

  it('needs a question for Ask a question and sends earlier answers as context', async () => {
    const { user, image } = await userWithImage();
    testApp.vision.nextResult = { hasText: false, text: '' };
    await analyze(user, { imageId: image.id, task: 'ocr' });

    const missing = await analyze(user, {
      imageId: image.id,
      task: 'question',
    });
    const extra = await analyze(user, {
      imageId: image.id,
      task: 'ocr',
      question: 'Why?',
    });
    testApp.vision.nextResult = { answer: 'It is red.' };
    const asked = await analyze(user, {
      imageId: image.id,
      task: 'question',
      question: '  What color is it?  ',
    });

    assert.equal(missing.statusCode, 400);
    assert.equal(extra.statusCode, 400);
    assert.equal(asked.statusCode, 201);
    assert.equal(asked.body.data.analysis.question, 'What color is it?');
    assert.deepEqual(testApp.vision.calls.at(-1).history, [
      {
        question: 'Extract the text in this image.',
        answer: 'There is no readable text.',
      },
    ]);
  });

  it('refunds the credits when the model fails', async () => {
    const { user, image } = await userWithImage();
    testApp.vision.nextError = new ProviderError({ category: 'rate_limited' });

    const response = await analyze(user, {
      imageId: image.id,
      task: 'objects',
    });

    assert.equal(response.statusCode, 503);
    assert.match(response.body.message, /refunded/);
    assert.equal(await readBalance(user.user.id), 10);

    const [saved] = await testApp.runSql(
      'SELECT status, error_category FROM image_analyses WHERE image_id = $1',
      [image.id],
    );
    assert.deepEqual(saved, {
      status: 'failed',
      error_category: 'rate_limited',
    });
  });

  it('refuses without enough credits and before calling the model', async () => {
    const { user, image } = await userWithImage(0);
    const callsBefore = testApp.vision.calls.length;

    const response = await analyze(user, {
      imageId: image.id,
      task: 'caption',
    });

    assert.equal(response.statusCode, 400);
    assert.match(response.body.message, /This analysis costs/);
    assert.equal(testApp.vision.calls.length, callsBefore);
  });

  it('hides other users images and their analyses', async () => {
    const { user, image } = await userWithImage();
    const other = await testApp.registerAndLogin();
    testApp.vision.nextResult = { captions: ['One', 'Two', 'Three'] };
    await analyze(user, { imageId: image.id, task: 'caption' });

    const theirAnalysis = await analyze(other, {
      imageId: image.id,
      task: 'caption',
    });
    const theirList = await testApp.sendRequest({
      method: 'GET',
      url: `/api/vision/analyses?imageId=${image.id}`,
      accessToken: other.accessToken,
    });
    const myList = await testApp.sendRequest({
      method: 'GET',
      url: `/api/vision/analyses?imageId=${image.id}`,
      accessToken: user.accessToken,
    });
    const unknown = await analyze(user, {
      imageId: UNKNOWN_ID,
      task: 'caption',
    });

    assert.equal(theirAnalysis.statusCode, 404);
    assert.deepEqual(theirList.body.data.analyses, []);
    assert.equal(myList.body.data.analyses.length, 1);
    assert.deepEqual(myList.body.data.analyses[0].result.captions, [
      'One',
      'Two',
      'Three',
    ]);
    assert.equal(unknown.statusCode, 404);
  });

  it('lets an admin change the vision model and price', async () => {
    const admin = await testApp.registerAndLoginAsAdmin();
    const saved = await testApp.runSql(
      "SELECT key, value FROM platform_settings WHERE key IN ('vision_model', 'vision_credits')",
    );

    try {
      const settings = await testApp.sendRequest({
        method: 'GET',
        url: '/api/admin/settings',
        accessToken: admin.accessToken,
      });
      const changed = await testApp.sendRequest({
        method: 'PATCH',
        url: '/api/admin/settings',
        accessToken: admin.accessToken,
        payload: { visionModel: 'gpt-4.1-nano', visionCredits: 3 },
      });
      const options = await testApp.sendRequest({
        method: 'GET',
        url: '/api/vision/options',
        accessToken: admin.accessToken,
      });
      const invalid = await testApp.sendRequest({
        method: 'PATCH',
        url: '/api/admin/settings',
        accessToken: admin.accessToken,
        payload: { visionModel: 'not-a-model' },
      });

      assert.ok(settings.body.data.visionModels.includes('gpt-4.1-mini'));
      assert.equal(changed.body.data.settings.visionModel, 'gpt-4.1-nano');
      assert.equal(changed.body.data.settings.visionCredits, 3);
      assert.equal(typeof changed.body.data.settings.signupCredits, 'number');
      assert.equal(options.body.data.model, 'gpt-4.1-nano');
      assert.equal(options.body.data.creditsPerAnalysis, 3);
      assert.equal(invalid.statusCode, 400);
    } finally {
      for (const row of saved) {
        await testApp.runSql(
          'UPDATE platform_settings SET value = $2::jsonb WHERE key = $1',
          [row.key, JSON.stringify(row.value)],
        );
      }
    }
  });

  it('refunds analyses stuck in processing', async () => {
    const { user, image } = await userWithImage();
    const stuck = await startImageAnalysisService({
      db: testApp.app.db,
      userId: user.user.id,
      imageId: image.id,
      task: 'describe',
      question: null,
      model: 'gpt-4.1-mini',
      credits: 2,
    });
    await testApp.runSql(
      "UPDATE image_analyses SET created_at = now() - interval '11 minutes' WHERE id = $1",
      [stuck.id],
    );

    await refundStuckImageAnalysesService({ db: testApp.app.db });
    const secondRun = await refundStuckImageAnalysesService({
      db: testApp.app.db,
    });

    assert.equal(await readBalance(user.user.id), 10);
    assert.equal(secondRun, 0);
  });
});
