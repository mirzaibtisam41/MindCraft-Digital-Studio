import { NotFoundError } from '#src/utils/index.js';
import { updateUserRepository } from '#src/modules/users/shared/repositories/index.js';

export async function updateMyProfileController(request, reply) {
  const user = await updateUserRepository({
    db: request.server.db,
    id: request.user.id,
    data: { name: request.body.name.trim() },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return reply.success({ data: { user }, message: 'Profile saved' });
}
