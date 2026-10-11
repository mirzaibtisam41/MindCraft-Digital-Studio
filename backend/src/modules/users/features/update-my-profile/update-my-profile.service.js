import * as userRepositories from '#src/modules/users/shared/repositories/index.js';

export async function updateMyProfileService({ db, userId, data }) {
  return userRepositories.updateUserRepository({
    db,
    id: userId,
    data: { name: data.name.trim() },
  });
}
