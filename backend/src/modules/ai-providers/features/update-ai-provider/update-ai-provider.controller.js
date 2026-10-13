import { updateAiProviderService } from './update-ai-provider.service.js';

export async function updateAiProviderController(request, reply) {
  const provider = await updateAiProviderService({
    db: request.server.db,
    id: request.params.id,
    data: request.body,
  });

  return reply.success({ data: { provider }, message: 'Provider updated' });
}
