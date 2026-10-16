import { StatusCodes } from 'http-status-codes';
import { createProjectCollectionService } from '#src/modules/projects/features/create-project-collection/create-project-collection.service.js';

export async function createProjectCollectionController(request, reply) {
  const collection = await createProjectCollectionService({
    db: request.server.db,
    userId: request.user.id,
    projectId: request.params.projectId,
    name: request.body.name,
  });

  return reply.success({
    data: { collection },
    message: 'Collection created',
    statusCode: StatusCodes.CREATED,
  });
}
