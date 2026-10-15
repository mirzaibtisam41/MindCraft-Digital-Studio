import { listMyImagesService } from '#src/modules/images/features/list-my-images/list-my-images.service.js';

export async function listMyImagesController(request, reply) {
  const { images, meta } = await listMyImagesService({
    db: request.server.db,
    storage: request.server.storage,
    userId: request.user.id,
    query: request.query,
  });

  return reply.success({ data: { images }, meta });
}
