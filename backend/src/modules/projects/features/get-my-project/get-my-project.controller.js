import { getProjectDetailService } from '#src/modules/projects/shared/services/index.js';

export async function getMyProjectController(request, reply) {
  const project = await getProjectDetailService({
    db: request.server.db,
    storage: request.server.storage,
    userId: request.user.id,
    projectId: request.params.projectId,
  });

  return reply.success({ data: { project } });
}
