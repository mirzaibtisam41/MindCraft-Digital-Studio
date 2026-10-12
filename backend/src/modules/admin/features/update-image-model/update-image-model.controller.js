import { presentImageModelService } from '#src/modules/admin/shared/services/index.js';
import { updateImageModelService } from './update-image-model.service.js';

export async function updateImageModelController(request, reply) {
  const imageModel = await updateImageModelService({
    db: request.server.db,
    actorId: request.user.id,
    id: request.params.id,
    input: request.body,
  });

  return reply.success({
    data: presentImageModelService(imageModel),
    message: 'Image model updated',
  });
}
