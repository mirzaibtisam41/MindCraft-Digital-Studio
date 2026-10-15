import { listGenerationTypesService } from '#src/modules/generation-types/features/list-generation-types/list-generation-types.service.js';

export async function listGenerationTypesController(request, reply) {
  const generationTypes = await listGenerationTypesService({
    db: request.server.db,
  });

  return reply.success({ data: { generationTypes } });
}
