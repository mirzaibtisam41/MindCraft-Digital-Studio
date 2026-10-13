import { listGenerationTypesService } from './list-generation-types.service.js';

export async function listGenerationTypesController(request, reply) {
  const generationTypes = await listGenerationTypesService({
    db: request.server.db,
  });

  return reply.success({ data: { generationTypes } });
}
