import { updateGenerationTypeService } from './update-generation-type.service.js';

export async function updateGenerationTypeController(request, reply) {
  const generationType = await updateGenerationTypeService({
    db: request.server.db,
    id: request.params.id,
    data: request.body,
  });

  return reply.success({
    data: { generationType },
    message: 'Generation type updated',
  });
}
