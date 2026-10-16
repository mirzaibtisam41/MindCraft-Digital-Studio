import {
  BadRequestError,
  NotFoundError,
  hashPasswordUtil,
  verifyPasswordUtil,
} from '#src/utils/index.js';
import {
  findUserPasswordHashByIdRepository,
  updateUserRepository,
} from '#src/modules/users/shared/repositories/index.js';
import { revokeOtherAuthSessionFamiliesRepository } from '#src/modules/auth-sessions/shared/repositories/index.js';

export async function changeMyPasswordService({
  db,
  userId,
  currentFamilyId,
  currentPassword,
  newPassword,
}) {
  const passwordHash = await findUserPasswordHashByIdRepository({
    db,
    id: userId,
  });

  if (!passwordHash) {
    throw new NotFoundError('User not found');
  }

  const isCurrentPasswordRight = await verifyPasswordUtil({
    password: currentPassword,
    passwordHash,
  });

  if (!isCurrentPasswordRight) {
    throw new BadRequestError('Your current password is not right');
  }

  if (currentPassword === newPassword) {
    throw new BadRequestError('Choose a password you have not used just now');
  }

  const newPasswordHash = await hashPasswordUtil({ password: newPassword });

  const loggedOutCount = await db.transaction(async (tx) => {
    await updateUserRepository({
      db: tx,
      id: userId,
      data: { passwordHash: newPasswordHash },
    });

    return revokeOtherAuthSessionFamiliesRepository({
      db: tx,
      userId,
      currentFamilyId,
    });
  });

  return { loggedOutCount };
}
