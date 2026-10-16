import { sql } from 'drizzle-orm';
import { BadRequestError, hashPasswordUtil } from '#src/utils/index.js';
import { users } from '#src/modules/users/user.table.js';
import { updateUserRepository } from '#src/modules/users/shared/repositories/index.js';
import { revokeAllUserAuthSessionsRepository } from '#src/modules/auth-sessions/shared/repositories/index.js';
import { AUTH_TOKEN_TYPE } from '#src/modules/auth-tokens/auth-token.constants.js';
import { useAuthTokenService } from '#src/modules/auth-tokens/shared/services/index.js';

export async function resetPasswordService({ db, token, newPassword }) {
  const passwordHash = await hashPasswordUtil({ password: newPassword });

  return db.transaction(async (tx) => {
    const usedToken = await useAuthTokenService({
      db: tx,
      token,
      type: AUTH_TOKEN_TYPE.PASSWORD_RESET,
    });

    if (!usedToken) {
      throw new BadRequestError(
        'This reset link is not valid anymore. Ask for a new one.',
      );
    }

    await updateUserRepository({
      db: tx,
      id: usedToken.userId,
      data: {
        passwordHash,
        emailVerifiedAt: sql`coalesce(${users.emailVerifiedAt}, now())`,
      },
    });

    return revokeAllUserAuthSessionsRepository({
      db: tx,
      userId: usedToken.userId,
    });
  });
}
