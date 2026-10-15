import { updateAiProviderStatusService } from '#src/modules/ai-providers/features/update-ai-provider-status/update-ai-provider-status.service.js';

export async function updateAiProviderStatusController(request, reply) {
  const provider = await updateAiProviderStatusService({
    db: request.server.db,
    id: request.params.id,
    isActive: request.body.isActive,
  });

  return reply.success({
    data: { provider },
    message: provider.isActive ? 'Provider activated' : 'Provider deactivated',
  });
}
