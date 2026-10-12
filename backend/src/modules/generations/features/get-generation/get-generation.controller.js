import { getGenerationService } from './get-generation.service.js';

export async function getGenerationController(request, reply) {
  const generation = await getGenerationService({
    db: request.server.db,
    storage: request.server.storage,
    userId: request.user.id,
    generationId: request.params.id,
  });

  return reply.success({ data: generation });
}
