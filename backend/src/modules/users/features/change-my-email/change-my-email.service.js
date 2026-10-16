import {
  BadRequestError,
  ConflictError,
  TooManyRequestsError,
  verifyPasswordUtil,
} from '#src/utils/index.js';
import {
  findUserPasswordHashByIdRepository,
  findUserWithPasswordByEmailRepository,
} from '#src/modules/users/shared/repositories/index.js';
import { AUTH_TOKEN_TYPE } from '#src/modules/auth-tokens/auth-token.constants.js';
import {
  issueAuthTokenService,
  wasAuthTokenSentRecentlyService,
} from '#src/modules/auth-tokens/shared/services/index.js';
import { buildActionEmail } from '#src/modules/auth/shared/emails/index.js';

export async function changeMyEmailService({
  server,
  user,
  newEmail,
  currentPassword,
}) {
  const { db } = server;
  const email = newEmail.trim().toLowerCase();

  const passwordHash = await findUserPasswordHashByIdRepository({
    db,
    id: user.id,
  });
  const isPasswordRight = await verifyPasswordUtil({
    password: currentPassword,
    passwordHash,
  });

  if (!isPasswordRight) {
    throw new BadRequestError('Your current password is not right');
  }

  if (email === user.email.toLowerCase()) {
    throw new BadRequestError('This is already your email');
  }

  if (await findUserWithPasswordByEmailRepository({ db, email })) {
    throw new ConflictError('Another account already uses this email');
  }

  const wasSentRecently = await wasAuthTokenSentRecentlyService({
    db,
    userId: user.id,
    type: AUTH_TOKEN_TYPE.EMAIL_CHANGE,
    withinSeconds: 60,
  });

  if (wasSentRecently) {
    throw new TooManyRequestsError(
      'We just sent you an email. Wait a minute before asking again.',
    );
  }

  const token = await issueAuthTokenService({
    db,
    userId: user.id,
    type: AUTH_TOKEN_TYPE.EMAIL_CHANGE,
    validForMinutes: 24 * 60,
    data: { newEmail: email },
  });

  await server.mailer.sendEmail({
    to: email,
    ...buildActionEmail({
      subject: 'Confirm your new email for Mindcraft',
      name: user.name,
      intro: `You asked to use this address for your Mindcraft Digital Studio account instead of ${user.email}. Confirm it with the button below. The link works for 24 hours.`,
      buttonLabel: 'Use this email',
      link: `${server.config.APP_URL}/verify-email?token=${token}`,
      outro:
        'If you did not ask for this, ignore this email and nothing will change.',
    }),
  });

  return { newEmail: email };
}
