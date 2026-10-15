import { NotFoundError } from '#src/utils/index.js';
import { findUserByIdRepository } from '#src/modules/users/shared/repositories/index.js';

export async function getUserService({ db, id }) {
  const user = await findUserByIdRepository({ db, id });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
}
