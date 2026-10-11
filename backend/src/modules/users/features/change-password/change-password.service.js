import {
  BadRequestError,
  hashPasswordUtil,
  verifyPasswordUtil,
} from '#src/utils/index.js';
import * as passwordResetTokenRepositories from '#src/modules/password-reset-tokens/shared/repositories/index.js';
import * as sessionRepositories from '#src/modules/sessions/shared/repositories/index.js';
import * as userRepositories from '#src/modules/users/shared/repositories/index.js';

async function checkCurrentPassword({ db, userId, currentPassword }) {
  const user = await userRepositories.findUserWithPasswordByIdRepository({
    db,
    id: userId,
  });

  const isPasswordValid = await verifyPasswordUtil({
    password: currentPassword,
    passwordHash: user.passwordHash,
  });

  if (!isPasswordValid) {
    throw new BadRequestError('Current password is incorrect');
  }
}

export async function changePasswordService({
  db,
  userId,
  sessionId,
  currentPassword,
  newPassword,
}) {
  if (currentPassword === newPassword) {
    throw new BadRequestError(
      'New password must be different from the current password',
    );
  }

  await checkCurrentPassword({ db, userId, currentPassword });

  const passwordHash = await hashPasswordUtil({ password: newPassword });

  await db.transaction(async (tx) => {
    await userRepositories.updateUserRepository({
      db: tx,
      id: userId,
      data: { passwordHash },
    });

    await sessionRepositories.revokeUserSessionsRepository({
      db: tx,
      userId,
      exceptSessionId: sessionId,
    });

    await passwordResetTokenRepositories.invalidateUserPasswordResetTokensRepository(
      { db: tx, userId },
    );
  });
}
