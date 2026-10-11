import {
  ConflictError,
  hashPasswordUtil,
  isDuplicateValueErrorUtil,
} from '#src/utils/index.js';
import { EMAIL_TAKEN_MESSAGE } from '#src/modules/auth/auth.constants.js';
import * as authServices from '#src/modules/auth/shared/services/index.js';
import * as userRepositories from '#src/modules/users/shared/repositories/index.js';
import * as userSettingRepositories from '#src/modules/user-settings/shared/repositories/index.js';

async function checkEmailIsFree({ db, email }) {
  const existingUser = await userRepositories.findUserByEmailRepository({
    db,
    email,
  });

  if (existingUser) {
    throw new ConflictError(EMAIL_TAKEN_MESSAGE);
  }
}

async function createUserWithSession({ server, newUser, client }) {
  return server.db.transaction(async (tx) => {
    const user = await userRepositories.insertUserRepository({
      db: tx,
      data: newUser,
    });

    await userSettingRepositories.insertUserSettingsRepository({
      db: tx,
      userId: user.id,
    });

    const tokens = await authServices.createSessionService({
      server,
      db: tx,
      userId: user.id,
      client,
    });

    return { ...tokens, user };
  });
}

export async function registerService({ server, data, client }) {
  const email = data.email.toLowerCase();

  await checkEmailIsFree({ db: server.db, email });

  const newUser = {
    name: data.name.trim(),
    email,
    passwordHash: await hashPasswordUtil({ password: data.password }),
  };

  try {
    return await createUserWithSession({ server, newUser, client });
  } catch (error) {
    if (isDuplicateValueErrorUtil({ error })) {
      throw new ConflictError(EMAIL_TAKEN_MESSAGE);
    }

    throw error;
  }
}
