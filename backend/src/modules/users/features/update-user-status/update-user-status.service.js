import { BadRequestError, NotFoundError } from '#src/utils/index.js';
import { USER_STATUS } from '#src/modules/users/user.constants.js';
import { updateUserRepository } from '#src/modules/users/shared/repositories/index.js';
import { revokeAllUserAuthSessionsRepository } from '#src/modules/auth-sessions/shared/repositories/index.js';

export async function updateUserStatusService({ db, id, status, adminId }) {
  if (id === adminId) {
    throw new BadRequestError(
      'You cannot change the status of your own account',
    );
  }

  const user = await db.transaction(async (tx) => {
    const updatedUser = await updateUserRepository({
      db: tx,
      id,
      data: { status },
    });

    if (updatedUser && status === USER_STATUS.SUSPENDED) {
      await revokeAllUserAuthSessionsRepository({ db: tx, userId: id });
    }

    return updatedUser;
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
}
