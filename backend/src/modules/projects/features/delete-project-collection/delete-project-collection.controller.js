import { deleteProjectCollectionService } from '#src/modules/projects/features/delete-project-collection/delete-project-collection.service.js';

export async function deleteProjectCollectionController(request, reply) {
  await deleteProjectCollectionService({
    db: request.server.db,
    userId: request.user.id,
    projectId: request.params.projectId,
    collectionId: request.params.collectionId,
  });

  return reply.success({
    message: 'Collection deleted. Its images stay in the project.',
  });
}
