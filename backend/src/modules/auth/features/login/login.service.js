import {
  ForbiddenError,
  UnauthorizedError,
  hashPasswordUtil,
  verifyPasswordUtil,
} from '#src/utils/index.js';
import {
  ACCOUNT_SUSPENDED_MESSAGE,
  INVALID_CREDENTIALS_MESSAGE,
} from '#src/modules/auth/auth.constants.js';
import * as authServices from '#src/modules/auth/shared/services/index.js';
import * as userRepositories from '#src/modules/users/shared/repositories/index.js';

const DUMMY_PASSWORD_HASH = await hashPasswordUtil({
  password: 'mindcraft-dummy-password-1',
});

async function verifyCredentials({ db, email, password }) {
  const user = await userRepositories.findUserWithPasswordByEmailRepository({
    db,
    email,
  });

  const isPasswordValid = await verifyPasswordUtil({
    password,
    passwordHash: user?.passwordHash ?? DUMMY_PASSWORD_HASH,
  });

  if (!user || !isPasswordValid) {
    throw new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE);
  }

  if (user.suspendedAt) {
    throw new ForbiddenError(ACCOUNT_SUSPENDED_MESSAGE);
  }

  const { passwordHash: _passwordHash, ...safeUser } = user;

  return safeUser;
}

export async function loginService({ server, email, password, client }) {
  const user = await verifyCredentials({
    db: server.db,
    email: email.toLowerCase(),
    password,
  });

  const tokens = await authServices.createSessionService({
    server,
    userId: user.id,
    client,
  });

  return { ...tokens, user };
}
