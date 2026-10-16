import { updateMyImageService } from '#src/modules/images/features/update-my-image/update-my-image.service.js';

export async function updateMyImageController(request, reply) {
  const image = await updateMyImageService({
    db: request.server.db,
    storage: request.server.storage,
    userId: request.user.id,
    id: request.params.id,
    isFavorite: request.body.isFavorite,
  });

  return reply.success({
    data: { image },
    message: image.isFavorite ? 'Added to favorites' : 'Removed from favorites',
  });
}
