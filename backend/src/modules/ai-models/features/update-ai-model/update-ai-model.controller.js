import { updateAiModelService } from '#src/modules/ai-models/features/update-ai-model/update-ai-model.service.js';

export async function updateAiModelController(request, reply) {
  const model = await updateAiModelService({
    db: request.server.db,
    id: request.params.id,
    data: request.body,
    adminId: request.user.id,
  });

  return reply.success({ data: { model }, message: 'Model updated' });
}
