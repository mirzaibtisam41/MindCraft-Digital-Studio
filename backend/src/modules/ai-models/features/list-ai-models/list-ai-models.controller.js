import { listAiModelsService } from '#src/modules/ai-models/features/list-ai-models/list-ai-models.service.js';

export async function listAiModelsController(request, reply) {
  const { models, meta } = await listAiModelsService({
    db: request.server.db,
    query: request.query,
  });

  return reply.success({ data: { models }, meta });
}
