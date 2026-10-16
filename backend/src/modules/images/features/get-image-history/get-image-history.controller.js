import { getImageHistoryService } from '#src/modules/images/features/get-image-history/get-image-history.service.js';

export async function getImageHistoryController(request, reply) {
  const steps = await getImageHistoryService({
    db: request.server.db,
    storage: request.server.storage,
    userId: request.user.id,
    id: request.params.id,
  });

  return reply.success({ data: { steps } });
}
