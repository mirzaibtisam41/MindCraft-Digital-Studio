import { getAiProviderService } from './get-ai-provider.service.js';

export async function getAiProviderController(request, reply) {
  const provider = await getAiProviderService({
    db: request.server.db,
    id: request.params.id,
  });

  return reply.success({ data: { provider } });
}
