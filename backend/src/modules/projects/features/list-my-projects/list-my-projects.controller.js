import { listMyProjectsService } from '#src/modules/projects/features/list-my-projects/list-my-projects.service.js';

export async function listMyProjectsController(request, reply) {
  const { projects, meta } = await listMyProjectsService({
    db: request.server.db,
    storage: request.server.storage,
    userId: request.user.id,
    query: request.query,
  });

  return reply.success({ data: { projects }, meta });
}
