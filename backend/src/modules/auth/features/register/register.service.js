import {
  ConflictError,
  hashPasswordUtil,
  isUniqueViolationErrorUtil,
} from '#src/utils/index.js';
import { EMAIL_ALREADY_REGISTERED_MESSAGE } from '#src/modules/auth/auth.constants.js';
import {
  createUserRepository,
  findUserByEmailRepository,
} from '#src/modules/users/shared/repositories/index.js';

export async function registerService({ db, data }) {
  const name = data.name.trim();
  const email = data.email.trim().toLowerCase();

  const existingUser = await findUserByEmailRepository({ db, email });

  if (existingUser) {
    throw new ConflictError(EMAIL_ALREADY_REGISTERED_MESSAGE);
  }

  const passwordHash = await hashPasswordUtil({ password: data.password });

  try {
    return await createUserRepository({
      db,
      data: { name, email, passwordHash },
    });
  } catch (error) {
    if (isUniqueViolationErrorUtil({ error })) {
      throw new ConflictError(EMAIL_ALREADY_REGISTERED_MESSAGE);
    }

    throw error;
  }
}
