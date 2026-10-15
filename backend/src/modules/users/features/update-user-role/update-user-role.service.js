import { BadRequestError, NotFoundError } from '#src/utils/index.js';
import { updateUserRepository } from '#src/modules/users/shared/repositories/index.js';

export async function updateUserRoleService({ db, id, role, adminId }) {
  if (id === adminId) {
    throw new BadRequestError('You cannot change the role of your own account');
  }

  const user = await updateUserRepository({ db, id, data: { role } });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
}
