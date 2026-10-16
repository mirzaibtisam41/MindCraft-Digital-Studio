import { addProjectImagesService } from '#src/modules/projects/features/add-project-images/add-project-images.service.js';

export async function addProjectImagesController(request, reply) {
  const addedIds = await addProjectImagesService({
    db: request.server.db,
    userId: request.user.id,
    projectId: request.params.projectId,
    imageIds: request.body.imageIds,
    collectionId: request.body.collectionId,
  });

  return reply.success({
    data: { addedIds },
    message:
      addedIds.length === 1
        ? '1 image added to the project'
        : `${addedIds.length} images added to the project`,
  });
}
