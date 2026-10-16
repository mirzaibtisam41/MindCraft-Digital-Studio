import { renameProjectCollectionService } from '#src/modules/projects/features/rename-project-collection/rename-project-collection.service.js';

export async function renameProjectCollectionController(request, reply) {
  const collection = await renameProjectCollectionService({
    db: request.server.db,
    userId: request.user.id,
    projectId: request.params.projectId,
    collectionId: request.params.collectionId,
    name: request.body.name,
  });

  return reply.success({ data: { collection }, message: 'Collection renamed' });
}
