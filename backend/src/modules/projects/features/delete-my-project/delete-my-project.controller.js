import { deleteMyProjectService } from '#src/modules/projects/features/delete-my-project/delete-my-project.service.js';

export async function deleteMyProjectController(request, reply) {
  await deleteMyProjectService({
    db: request.server.db,
    userId: request.user.id,
    projectId: request.params.projectId,
  });

  return reply.success({ message: 'Project deleted' });
}
