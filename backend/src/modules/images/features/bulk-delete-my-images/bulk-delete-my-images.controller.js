import { bulkDeleteMyImagesService } from '#src/modules/images/features/bulk-delete-my-images/bulk-delete-my-images.service.js';

export async function bulkDeleteMyImagesController(request, reply) {
  const deletedIds = await bulkDeleteMyImagesService({
    db: request.server.db,
    storage: request.server.storage,
    log: request.log,
    userId: request.user.id,
    ids: request.body.ids,
  });

  return reply.success({
    data: { deletedIds },
    message:
      deletedIds.length === 1
        ? '1 image deleted'
        : `${deletedIds.length} images deleted`,
  });
}
