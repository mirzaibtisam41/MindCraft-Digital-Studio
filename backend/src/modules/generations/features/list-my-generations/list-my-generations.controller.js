import { listMyGenerationsService } from '#src/modules/generations/features/list-my-generations/list-my-generations.service.js';

export async function listMyGenerationsController(request, reply) {
  const { generations, meta } = await listMyGenerationsService({
    db: request.server.db,
    storage: request.server.storage,
    userId: request.user.id,
    query: request.query,
  });

  return reply.success({ data: { generations }, meta });
}
