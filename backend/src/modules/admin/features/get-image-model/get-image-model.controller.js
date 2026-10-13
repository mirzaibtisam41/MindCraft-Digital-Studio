import { getImageModelService } from './get-image-model.service.js';

export async function getImageModelController(request, reply) {
  const data = await getImageModelService({
    db: request.server.db,
    id: request.params.id,
  });

  return reply.success({ data });
}
