import { getAiModelService } from '#src/modules/ai-models/features/get-ai-model/get-ai-model.service.js';

export async function getAiModelController(request, reply) {
  const model = await getAiModelService({
    db: request.server.db,
    id: request.params.id,
  });

  return reply.success({ data: { model } });
}
