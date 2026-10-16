import { updateMyProjectService } from '#src/modules/projects/features/update-my-project/update-my-project.service.js';

export async function updateMyProjectController(request, reply) {
  const project = await updateMyProjectService({
    db: request.server.db,
    storage: request.server.storage,
    userId: request.user.id,
    projectId: request.params.projectId,
    data: request.body,
  });

  return reply.success({ data: { project }, message: 'Project saved' });
}
