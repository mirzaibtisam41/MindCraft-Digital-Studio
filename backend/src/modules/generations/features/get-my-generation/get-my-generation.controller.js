import { getMyGenerationService } from '#src/modules/generations/features/get-my-generation/get-my-generation.service.js';

export async function getMyGenerationController(request, reply) {
  const generation = await getMyGenerationService({
    db: request.server.db,
    storage: request.server.storage,
    userId: request.user.id,
    id: request.params.id,
  });

  return reply.success({ data: { generation } });
}
