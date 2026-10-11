import { MAIL_PROVIDER } from '#src/constants/index.js';
import {
  consoleMailProvider,
  resendMailProvider,
} from '#src/modules/mail/providers/index.js';

const MAIL_PROVIDER_SENDERS = {
  [MAIL_PROVIDER.CONSOLE]: consoleMailProvider,
  [MAIL_PROVIDER.RESEND]: resendMailProvider,
};

export async function sendEmailService({ server, to, subject, html, text }) {
  const sendEmail = MAIL_PROVIDER_SENDERS[server.config.MAIL_PROVIDER];

  await sendEmail({ server, email: { to, subject, html, text } });
}
