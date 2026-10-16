import { AUTH_TOKEN_TYPE } from '#src/modules/auth-tokens/auth-token.constants.js';
import { issueAuthTokenService } from '#src/modules/auth-tokens/shared/services/index.js';
import { buildActionEmail } from '#src/modules/auth/shared/emails/index.js';

export async function sendVerificationEmailService({ server, user }) {
  const token = await issueAuthTokenService({
    db: server.db,
    userId: user.id,
    type: AUTH_TOKEN_TYPE.EMAIL_VERIFY,
    validForMinutes: 24 * 60,
  });

  return server.mailer.sendEmail({
    to: user.email,
    ...buildActionEmail({
      subject: 'Confirm your email for Mindcraft',
      name: user.name,
      intro:
        'Welcome to Mindcraft Digital Studio. Please confirm that this is your email address. The link works for 24 hours.',
      buttonLabel: 'Confirm my email',
      link: `${server.config.APP_URL}/verify-email?token=${token}`,
      outro:
        'If you did not create an account, you can ignore this email and nothing will happen.',
    }),
  });
}
