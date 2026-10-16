import { listMyPromptsService } from '#src/modules/prompts/features/list-my-prompts/list-my-prompts.service.js';

export async function listMyPromptsController(request, reply) {
  const { prompts, categoryCounts } = await listMyPromptsService({
    db: request.server.db,
    userId: request.user.id,
    query: request.query,
  });

  return reply.success({ data: { prompts }, meta: { categoryCounts } });
}
