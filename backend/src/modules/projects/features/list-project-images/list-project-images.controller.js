import { listProjectImagesService } from '#src/modules/projects/features/list-project-images/list-project-images.service.js';

export async function listProjectImagesController(request, reply) {
  const { images, meta } = await listProjectImagesService({
    db: request.server.db,
    storage: request.server.storage,
    userId: request.user.id,
    projectId: request.params.projectId,
    query: request.query,
  });

  return reply.success({ data: { images }, meta });
}
