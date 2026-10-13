import { deleteAiProviderService } from './delete-ai-provider.service.js';

export async function deleteAiProviderController(request, reply) {
  await deleteAiProviderService({
    db: request.server.db,
    id: request.params.id,
  });

  return reply.success({ message: 'Provider deleted' });
}
