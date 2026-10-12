import { StatusCodes } from 'http-status-codes';
import { presentImageModelService } from '#src/modules/admin/shared/services/index.js';
import { createImageModelService } from './create-image-model.service.js';

export async function createImageModelController(request, reply) {
  const imageModel = await createImageModelService({
    db: request.server.db,
    actorId: request.user.id,
    input: request.body,
  });

  return reply.success({
    data: presentImageModelService(imageModel),
    message: 'Image model created',
    statusCode: StatusCodes.CREATED,
  });
}
