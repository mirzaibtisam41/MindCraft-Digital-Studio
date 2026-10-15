import { deleteGenerationTypeService } from '#src/modules/generation-types/features/delete-generation-type/delete-generation-type.service.js';

export async function deleteGenerationTypeController(request, reply) {
  await deleteGenerationTypeService({
    db: request.server.db,
    id: request.params.id,
  });

  return reply.success({ message: 'Generation type deleted' });
}
