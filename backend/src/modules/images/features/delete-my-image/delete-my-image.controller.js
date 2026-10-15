import { deleteMyImageService } from '#src/modules/images/features/delete-my-image/delete-my-image.service.js';

export async function deleteMyImageController(request, reply) {
  await deleteMyImageService({
    db: request.server.db,
    storage: request.server.storage,
    log: request.log,
    userId: request.user.id,
    id: request.params.id,
  });

  return reply.success({ message: 'Image deleted' });
}
