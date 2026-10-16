import { BadRequestError, TooManyRequestsError } from '#src/utils/index.js';
import { AUTH_TOKEN_TYPE } from '#src/modules/auth-tokens/auth-token.constants.js';
import { wasAuthTokenSentRecentlyService } from '#src/modules/auth-tokens/shared/services/index.js';
import { sendVerificationEmailService } from '#src/modules/auth/shared/services/index.js';

export async function resendVerificationController(request, reply) {
  const { server, user } = request;

  if (user.emailVerifiedAt) {
    throw new BadRequestError('Your email is already confirmed');
  }

  const wasSentRecently = await wasAuthTokenSentRecentlyService({
    db: server.db,
    userId: user.id,
    type: AUTH_TOKEN_TYPE.EMAIL_VERIFY,
    withinSeconds: 60,
  });

  if (wasSentRecently) {
    throw new TooManyRequestsError(
      'We just sent you an email. Wait a minute before asking again.',
    );
  }

  await sendVerificationEmailService({ server, user });

  return reply.success({
    data: null,
    message: `We sent a confirmation link to ${user.email}`,
  });
}
