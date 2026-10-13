import { randomUUID } from 'node:crypto';
import {
  ForbiddenError,
  UnauthorizedError,
  hashPasswordUtil,
  verifyPasswordUtil,
} from '#src/utils/index.js';
import {
  ACCOUNT_SUSPENDED_MESSAGE,
  INVALID_EMAIL_OR_PASSWORD_MESSAGE,
} from '#src/modules/auth/auth.constants.js';
import { USER_STATUS } from '#src/modules/users/user.constants.js';
import {
  findUserWithPasswordByEmailRepository,
  updateUserLastLoginAtRepository,
} from '#src/modules/users/shared/repositories/index.js';
import { startAuthSessionService } from '#src/modules/auth/shared/services/index.js';

const PASSWORD_HASH_FOR_UNKNOWN_EMAIL = await hashPasswordUtil({
  password: 'password-for-unknown-email',
});

export async function loginService({ server, data, client }) {
  const email = data.email.trim().toLowerCase();

  const user = await findUserWithPasswordByEmailRepository({
    db: server.db,
    email,
  });

  const isPasswordCorrect = await verifyPasswordUtil({
    password: data.password,
    passwordHash: user?.passwordHash ?? PASSWORD_HASH_FOR_UNKNOWN_EMAIL,
  });

  if (!user || !isPasswordCorrect) {
    throw new UnauthorizedError(INVALID_EMAIL_OR_PASSWORD_MESSAGE);
  }

  if (user.status === USER_STATUS.SUSPENDED) {
    throw new ForbiddenError(ACCOUNT_SUSPENDED_MESSAGE);
  }

  const { accessToken, refreshToken } = await startAuthSessionService({
    server,
    userId: user.id,
    familyId: randomUUID(),
    client,
  });

  await updateUserLastLoginAtRepository({ db: server.db, userId: user.id });

  const { passwordHash: _passwordHash, ...userWithoutPassword } = user;

  return { accessToken, refreshToken, user: userWithoutPassword };
}
