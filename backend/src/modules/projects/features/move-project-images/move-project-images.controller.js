import { moveProjectImagesService } from '#src/modules/projects/features/move-project-images/move-project-images.service.js';

export async function moveProjectImagesController(request, reply) {
  const movedIds = await moveProjectImagesService({
    db: request.server.db,
    userId: request.user.id,
    projectId: request.params.projectId,
    imageIds: request.body.imageIds,
    collectionId: request.body.collectionId,
  });

  return reply.success({
    data: { movedIds },
    message: request.body.collectionId
      ? 'Images moved to the collection'
      : 'Images removed from the collection',
  });
}
