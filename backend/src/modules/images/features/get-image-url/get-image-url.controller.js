import { getImageUrlService } from './get-image-url.service.js';

export async function getImageUrlController(request, reply) {
  const signedUrl = await getImageUrlService({
    db: request.server.db,
    storage: request.server.storage,
    userId: request.user.id,
    imageId: request.params.id,
  });

  return reply.success({ data: signedUrl });
}
