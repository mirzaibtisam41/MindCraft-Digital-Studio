import { sql } from 'drizzle-orm';
import { BadRequestError } from '#src/utils/index.js';
import { users } from '#src/modules/users/user.table.js';
import { updateUserRepository } from '#src/modules/users/shared/repositories/index.js';
import { AUTH_TOKEN_TYPE } from '#src/modules/auth-tokens/auth-token.constants.js';
import { useAuthTokenService } from '#src/modules/auth-tokens/shared/services/index.js';

export function verifyEmailService({ db, token }) {
  return db.transaction(async (tx) => {
    const usedToken = await useAuthTokenService({
      db: tx,
      token,
      type: AUTH_TOKEN_TYPE.EMAIL_VERIFY,
    });

    if (!usedToken) {
      throw new BadRequestError(
        'This confirmation link is not valid anymore. Ask for a new one.',
      );
    }

    return updateUserRepository({
      db: tx,
      id: usedToken.userId,
      data: { emailVerifiedAt: sql`coalesce(${users.emailVerifiedAt}, now())` },
    });
  });
}
