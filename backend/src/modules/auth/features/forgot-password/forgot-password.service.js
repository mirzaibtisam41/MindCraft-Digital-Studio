import { findUserWithPasswordByEmailRepository } from '#src/modules/users/shared/repositories/index.js';
import { AUTH_TOKEN_TYPE } from '#src/modules/auth-tokens/auth-token.constants.js';
import {
  issueAuthTokenService,
  wasAuthTokenSentRecentlyService,
} from '#src/modules/auth-tokens/shared/services/index.js';
import { buildActionEmail } from '#src/modules/auth/shared/emails/index.js';

export async function forgotPasswordService({ server, email }) {
  const user = await findUserWithPasswordByEmailRepository({
    db: server.db,
    email: email.trim().toLowerCase(),
  });

  if (!user) return;

  const wasSentRecently = await wasAuthTokenSentRecentlyService({
    db: server.db,
    userId: user.id,
    type: AUTH_TOKEN_TYPE.PASSWORD_RESET,
    withinSeconds: 120,
  });

  if (wasSentRecently) return;

  const token = await issueAuthTokenService({
    db: server.db,
    userId: user.id,
    type: AUTH_TOKEN_TYPE.PASSWORD_RESET,
    validForMinutes: 30,
  });

  await server.mailer.sendEmail({
    to: user.email,
    ...buildActionEmail({
      subject: 'Reset your Mindcraft password',
      name: user.name,
      intro:
        'Someone asked to reset the password of your Mindcraft Digital Studio account. Use the button below to choose a new one. The link works for 30 minutes and only once.',
      buttonLabel: 'Choose a new password',
      link: `${server.config.APP_URL}/reset-password?token=${token}`,
      outro:
        'If you did not ask for this, you can ignore this email. Your password stays the same.',
    }),
  });
}
