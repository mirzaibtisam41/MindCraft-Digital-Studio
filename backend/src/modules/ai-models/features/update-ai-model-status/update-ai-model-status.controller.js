import { updateAiModelStatusService } from './update-ai-model-status.service.js';

export async function updateAiModelStatusController(request, reply) {
  const model = await updateAiModelStatusService({
    db: request.server.db,
    id: request.params.id,
    status: request.body.status,
    adminId: request.user.id,
  });

  return reply.success({
    data: { model },
    message: `Model status changed to ${model.status}`,
  });
}
