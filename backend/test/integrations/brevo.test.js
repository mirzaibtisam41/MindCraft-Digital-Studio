import { afterEach, describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { sendBrevoEmailIntegration } from '#src/integrations/index.js';

const appConfig = {
  BREVO_API_KEY: 'test-brevo-key',
  MAIL_FROM_EMAIL: 'studio@example.com',
};

const email = {
  to: 'sara@example.com',
  subject: 'Reset your password',
  html: '<p>Hello</p>',
  text: 'Hello',
};

describe('Brevo integration', () => {
  afterEach(() => {
    mock.restoreAll();
  });

  it('sends the email through the Brevo transactional API', async () => {
    const fetchMock = mock.method(globalThis, 'fetch', async () =>
      Response.json({ messageId: '<abc@brevo>' }, { status: 201 }),
    );

    const result = await sendBrevoEmailIntegration({ appConfig, ...email });
    const [url, request] = fetchMock.mock.calls[0].arguments;
    const body = JSON.parse(request.body);

    assert.equal(result.messageId, '<abc@brevo>');
    assert.equal(url, 'https://api.brevo.com/v3/smtp/email');
    assert.equal(request.method, 'POST');
    assert.equal(request.headers['api-key'], 'test-brevo-key');
    assert.deepEqual(body.sender, {
      email: 'studio@example.com',
      name: 'Mindcraft Digital Studio',
    });
    assert.deepEqual(body.to, [{ email: 'sara@example.com' }]);
    assert.equal(body.subject, 'Reset your password');
    assert.equal(body.htmlContent, '<p>Hello</p>');
    assert.equal(body.textContent, 'Hello');
  });

  it('throws without the response body when Brevo refuses', async () => {
    mock.method(globalThis, 'fetch', async () =>
      Response.json(
        { message: 'Key not found test-brevo-key' },
        { status: 401 },
      ),
    );

    await assert.rejects(
      sendBrevoEmailIntegration({ appConfig, ...email }),
      (error) =>
        error.message === 'Brevo answered with status 401' &&
        !error.message.includes('test-brevo-key'),
    );
  });
});
