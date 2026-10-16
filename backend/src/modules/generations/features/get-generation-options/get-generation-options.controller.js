import { getGenerationOptionsService } from '#src/modules/generations/features/get-generation-options/get-generation-options.service.js';

export async function getGenerationOptionsController(request, reply) {
  const models = await getGenerationOptionsService({ db: request.server.db });

  return reply.success({ data: { models } });
}
