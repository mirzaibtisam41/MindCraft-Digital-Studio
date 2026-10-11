import { generateTokenUtil, hashTokenUtil } from '#src/utils/index.js';
import * as mailServices from '#src/modules/mail/shared/services/index.js';
import { buildPasswordResetEmailTemplate } from '#src/modules/mail/templates/password-reset-email.template.js';
import { PASSWORD_RESET_TOKEN_TTL_MINUTES } from '#src/modules/passwordResetTokens/password-reset-token.constants.js';
import * as passwordResetTokenRepositories from '#src/modules/passwordResetTokens/shared/repositories/index.js';
import * as userRepositories from '#src/modules/users/shared/repositories/index.js';

const MINUTE_MS = 60 * 1000;

function buildResetUrl({ appConfig, token }) {
  const resetUrl = new URL('/reset-password', appConfig.CLIENT_APP_URL);

  resetUrl.searchParams.set('token', token);

  return resetUrl.toString();
}

async function saveResetToken({ db, userId, token }) {
  await db.transaction(async (tx) => {
    await passwordResetTokenRepositories.invalidateUserPasswordResetTokensRepository(
      { db: tx, userId },
    );

    await passwordResetTokenRepositories.insertPasswordResetTokenRepository({
      db: tx,
      data: {
        userId,
        tokenHash: hashTokenUtil({ token }),
        expiresAt: new Date(
          Date.now() + PASSWORD_RESET_TOKEN_TTL_MINUTES * MINUTE_MS,
        ),
      },
    });
  });
}

async function sendResetEmail({ server, user, token }) {
  const email = buildPasswordResetEmailTemplate({
    name: user.name,
    resetUrl: buildResetUrl({ appConfig: server.config, token }),
    expiresInMinutes: PASSWORD_RESET_TOKEN_TTL_MINUTES,
  });

  try {
    await mailServices.sendEmailService({ server, to: user.email, ...email });
  } catch (error) {
    server.log.error(
      { err: error, userId: user.id },
      'Could not send password reset email',
    );
  }
}

export async function forgotPasswordService({ server, email }) {
  const user = await userRepositories.findUserByEmailRepository({
    db: server.db,
    email: email.toLowerCase(),
  });

  if (!user) return;

  const token = generateTokenUtil();

  await saveResetToken({ db: server.db, userId: user.id, token });
  await sendResetEmail({ server, user, token });
}
