import {
  BadRequestError,
  hashPasswordUtil,
  hashTokenUtil,
} from '#src/utils/index.js';
import { RESET_LINK_INVALID_MESSAGE } from '#src/modules/auth/auth.constants.js';
import * as passwordResetTokenRepositories from '#src/modules/password-reset-tokens/shared/repositories/index.js';
import * as sessionRepositories from '#src/modules/sessions/shared/repositories/index.js';
import * as userRepositories from '#src/modules/users/shared/repositories/index.js';

export async function resetPasswordService({ server, token, password }) {
  const passwordHash = await hashPasswordUtil({ password });

  await server.db.transaction(async (tx) => {
    const resetToken =
      await passwordResetTokenRepositories.consumePasswordResetTokenRepository({
        db: tx,
        tokenHash: hashTokenUtil({ token }),
      });

    if (!resetToken) {
      throw new BadRequestError(RESET_LINK_INVALID_MESSAGE);
    }

    const { userId } = resetToken;

    await userRepositories.updateUserRepository({
      db: tx,
      id: userId,
      data: { passwordHash },
    });

    await passwordResetTokenRepositories.invalidateUserPasswordResetTokensRepository(
      { db: tx, userId },
    );

    await sessionRepositories.revokeUserSessionsRepository({ db: tx, userId });
  });
}
