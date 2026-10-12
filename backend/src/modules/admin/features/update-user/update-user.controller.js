import { updateUserService } from './update-user.service.js';

export async function updateUserController(request, reply) {
  const user = await updateUserService({
    db: request.server.db,
    actorId: request.user.id,
    id: request.params.id,
    input: request.body,
  });

  return reply.success({ data: user, message: 'User updated' });
}
