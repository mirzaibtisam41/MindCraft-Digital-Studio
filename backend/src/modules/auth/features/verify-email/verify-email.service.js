import { sql } from 'drizzle-orm';
import {
  BadRequestError,
  ConflictError,
  isUniqueViolationErrorUtil,
} from '#src/utils/index.js';
import { users } from '#src/modules/users/user.table.js';
import {
  findUserEmailByIdRepository,
  updateUserRepository,
} from '#src/modules/users/shared/repositories/index.js';
import { AUTH_TOKEN_TYPE } from '#src/modules/auth-tokens/auth-token.constants.js';
import { useAuthTokenService } from '#src/modules/auth-tokens/shared/services/index.js';

async function confirmEmail({ tx, token }) {
  const verifyToken = await useAuthTokenService({
    db: tx,
    token,
    type: AUTH_TOKEN_TYPE.EMAIL_VERIFY,
  });

  if (verifyToken) {
    const user = await updateUserRepository({
      db: tx,
      id: verifyToken.userId,
      data: { emailVerifiedAt: sql`coalesce(${users.emailVerifiedAt}, now())` },
    });

    return { user, previousEmail: null };
  }

  const changeToken = await useAuthTokenService({
    db: tx,
    token,
    type: AUTH_TOKEN_TYPE.EMAIL_CHANGE,
  });

  if (!changeToken) {
    throw new BadRequestError(
      'This confirmation link is not valid anymore. Ask for a new one.',
    );
  }

  const previousEmail = await findUserEmailByIdRepository({
    db: tx,
    id: changeToken.userId,
  });

  const user = await updateUserRepository({
    db: tx,
    id: changeToken.userId,
    data: { email: changeToken.newEmail, emailVerifiedAt: new Date() },
  });

  return { user, previousEmail };
}

export async function verifyEmailService({ db, token }) {
  try {
    return await db.transaction((tx) => confirmEmail({ tx, token }));
  } catch (error) {
    if (isUniqueViolationErrorUtil({ error })) {
      throw new ConflictError('Another account started using this email');
    }

    throw error;
  }
}
