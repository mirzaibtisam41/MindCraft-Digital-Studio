import { updateGenerationTypeStatusService } from '#src/modules/generation-types/features/update-generation-type-status/update-generation-type-status.service.js';

export async function updateGenerationTypeStatusController(request, reply) {
  const generationType = await updateGenerationTypeStatusService({
    db: request.server.db,
    id: request.params.id,
    isActive: request.body.isActive,
  });

  return reply.success({
    data: { generationType },
    message: generationType.isActive
      ? 'Generation type activated'
      : 'Generation type deactivated',
  });
}
