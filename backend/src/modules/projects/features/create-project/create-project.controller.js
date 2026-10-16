import { StatusCodes } from 'http-status-codes';
import { createProjectService } from '#src/modules/projects/features/create-project/create-project.service.js';

export async function createProjectController(request, reply) {
  const project = await createProjectService({
    db: request.server.db,
    userId: request.user.id,
    data: request.body,
  });

  return reply.success({
    data: { project },
    message: 'Project created',
    statusCode: StatusCodes.CREATED,
  });
}
