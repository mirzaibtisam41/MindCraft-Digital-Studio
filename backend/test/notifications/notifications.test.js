import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { buildTestApp } from '../helpers/test-app.js';
import {
  failImageAnalysisService,
  startImageAnalysisService,
} from '#src/modules/image-analyses/shared/services/index.js';

const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

describe('notifications API', () => {
  let testApp;
  let admin;

  before(async () => {
    testApp = await buildTestApp();
    admin = await testApp.registerAndLoginAsAdmin();
  });

  after(async () => {
    await testApp.close();
  });

  function send(method, url, accessToken, payload) {
    return testApp.sendRequest({ method, url, accessToken, payload });
  }

  async function userWithBalance(balance) {
    const user = await testApp.registerAndLogin();
    await testApp.runSql(
      'UPDATE credit_wallets SET balance = $2 WHERE user_id = $1',
      [user.user.id, balance],
    );

    return user;
  }

  function adjustCredits(user, amount, reason = 'Support request') {
    return send(
      'POST',
      `/api/admin/users/${user.user.id}/credit-adjustments`,
      admin.accessToken,
      { amount, reason },
    );
  }

  async function listNotifications(user) {
    const response = await send('GET', '/api/notifications', user.accessToken);

    return {
      notifications: response.body.data.notifications,
      unreadCount: response.body.meta.unreadCount,
    };
  }

  it('requires login', async () => {
    const response = await send('GET', '/api/notifications');

    assert.equal(response.statusCode, 401);
  });

  it('tells the user when an admin adds credits', async () => {
    const user = await userWithBalance(100);

    await adjustCredits(user, 50, 'Welcome gift');
    const { notifications, unreadCount } = await listNotifications(user);

    assert.equal(unreadCount, 1);
    assert.equal(notifications[0].type, 'credits_added');
    assert.equal(notifications[0].title, '50 credits added to your balance');
    assert.equal(notifications[0].body, 'Welcome gift');
    assert.equal(notifications[0].link, '/app/credits');
    assert.equal(notifications[0].readAt, null);
  });

  it('warns once when the balance goes below the threshold', async () => {
    const user = await userWithBalance(25);

    await adjustCredits(user, -10);
    await adjustCredits(user, -2);
    const { notifications } = await listNotifications(user);
    const types = notifications.map((notification) => notification.type);

    assert.deepEqual(types.filter((type) => type === 'low_credits').length, 1);
    assert.equal(
      notifications.find((notification) => notification.type === 'low_credits')
        .title,
      'You have 15 credits left',
    );
    assert.equal(types.filter((type) => type === 'credits_removed').length, 2);
  });

  it('follows the user notification preferences and threshold', async () => {
    const user = await userWithBalance(100);
    await send('PATCH', '/api/me/settings', user.accessToken, {
      notifyCreditChanges: false,
      lowCreditThreshold: 60,
    });

    await adjustCredits(user, -50);
    const { notifications } = await listNotifications(user);

    assert.deepEqual(
      notifications.map((notification) => notification.type),
      ['low_credits'],
    );
  });

  it('tells the user when a failed analysis was refunded', async () => {
    const user = await userWithBalance(10);
    const content = await sharp({
      create: { width: 4, height: 4, channels: 3, background: '#00ff00' },
    })
      .png()
      .toBuffer();
    const image = await testApp.uploadImage({
      accessToken: user.accessToken,
      content,
    });
    const analysis = await startImageAnalysisService({
      db: testApp.app.db,
      userId: user.user.id,
      imageId: image.id,
      task: 'describe',
      question: null,
      model: 'gpt-4.1-mini',
      credits: 2,
    });

    await failImageAnalysisService({
      db: testApp.app.db,
      analysisId: analysis.id,
      errorCategory: 'timeout',
    });
    const { notifications } = await listNotifications(user);

    assert.equal(notifications[0].type, 'analysis_failed');
    assert.equal(
      notifications[0].title,
      'Image analysis failed · 2 credits refunded',
    );
    assert.equal(notifications[0].link, '/app/vision');
  });

  it('marks one or all notifications as read, only for the owner', async () => {
    const user = await userWithBalance(100);
    const stranger = await testApp.registerAndLogin();
    await adjustCredits(user, 5);
    await adjustCredits(user, 6);
    await adjustCredits(user, 7);
    const { notifications } = await listNotifications(user);

    const strangerRead = await send(
      'POST',
      `/api/notifications/${notifications[0].id}/read`,
      stranger.accessToken,
    );
    const unknown = await send(
      'POST',
      `/api/notifications/${UNKNOWN_ID}/read`,
      user.accessToken,
    );
    const read = await send(
      'POST',
      `/api/notifications/${notifications[0].id}/read`,
      user.accessToken,
    );
    const afterOne = await listNotifications(user);
    const readAll = await send(
      'POST',
      '/api/notifications/read-all',
      user.accessToken,
    );
    const afterAll = await listNotifications(user);

    assert.equal(strangerRead.statusCode, 404);
    assert.equal(unknown.statusCode, 404);
    assert.equal(read.statusCode, 200);
    assert.ok(read.body.data.notification.readAt);
    assert.equal(afterOne.unreadCount, 2);
    assert.equal(readAll.body.data.markedCount, 2);
    assert.equal(afterAll.unreadCount, 0);
  });
});
