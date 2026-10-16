import { removeProjectImagesService } from '#src/modules/projects/features/remove-project-images/remove-project-images.service.js';

export async function removeProjectImagesController(request, reply) {
  const removedIds = await removeProjectImagesService({
    db: request.server.db,
    userId: request.user.id,
    projectId: request.params.projectId,
    imageIds: request.body.imageIds,
  });

  return reply.success({
    data: { removedIds },
    message:
      removedIds.length === 1
        ? '1 image removed from the project'
        : `${removedIds.length} images removed from the project`,
  });
}
