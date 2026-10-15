import { getMyImageService } from '#src/modules/images/features/get-my-image/get-my-image.service.js';

export async function getMyImageController(request, reply) {
  const image = await getMyImageService({
    db: request.server.db,
    storage: request.server.storage,
    userId: request.user.id,
    id: request.params.id,
  });

  return reply.success({ data: { image } });
}
