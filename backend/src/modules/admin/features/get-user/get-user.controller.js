import { NotFoundError } from '#src/utils/index.js';
import * as userRepositories from '#src/modules/users/shared/repositories/index.js';

export async function getUserController(request, reply) {
  const user = await userRepositories.findUserForAdminRepository({
    db: request.server.db,
    id: request.params.id,
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return reply.success({ data: user });
}
