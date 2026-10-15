import { StatusCodes } from 'http-status-codes';
import { createAiModelService } from '#src/modules/ai-models/features/create-ai-model/create-ai-model.service.js';

export async function createAiModelController(request, reply) {
  const model = await createAiModelService({
    db: request.server.db,
    data: request.body,
    adminId: request.user.id,
  });

  return reply.success({
    data: { model },
    message: 'Model created',
    statusCode: StatusCodes.CREATED,
  });
}
