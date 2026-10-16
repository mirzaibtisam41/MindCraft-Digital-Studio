import { getMyImageDownloadService } from '#src/modules/images/features/get-my-image-download/get-my-image-download.service.js';

export async function getMyImageDownloadController(request, reply) {
  const url = await getMyImageDownloadService({
    db: request.server.db,
    storage: request.server.storage,
    userId: request.user.id,
    id: request.params.id,
  });

  return reply.success({ data: { url } });
}
