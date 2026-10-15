import { getUserService } from '#src/modules/users/features/get-user/get-user.service.js';

export async function getUserController(request, reply) {
  const user = await getUserService({
    db: request.server.db,
    id: request.params.userId,
  });

  return reply.success({ data: { user } });
}
