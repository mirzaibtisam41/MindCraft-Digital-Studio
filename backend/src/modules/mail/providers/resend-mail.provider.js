import { ServiceUnavailableError } from '#src/utils/index.js';

const RESEND_API_URL = 'https://api.resend.com/emails';
const RESEND_TIMEOUT_MS = 10000;
const EMAIL_FAILED_MESSAGE =
  'Could not send the email right now, please try again later';

export async function resendMailProvider({ server, email }) {
  let response;

  try {
    response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${server.config.RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: server.config.MAIL_FROM,
        to: [email.to],
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
      signal: AbortSignal.timeout(RESEND_TIMEOUT_MS),
    });
  } catch (error) {
    server.log.error(
      { err: error, subject: email.subject },
      'Email request failed',
    );

    throw new ServiceUnavailableError(EMAIL_FAILED_MESSAGE);
  }

  if (!response.ok) {
    server.log.error(
      { status: response.status, subject: email.subject },
      'Email provider rejected the email',
    );

    throw new ServiceUnavailableError(EMAIL_FAILED_MESSAGE);
  }
}
