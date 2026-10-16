import { updateMyPromptService } from '#src/modules/prompts/features/update-my-prompt/update-my-prompt.service.js';

export async function updateMyPromptController(request, reply) {
  const prompt = await updateMyPromptService({
    db: request.server.db,
    userId: request.user.id,
    id: request.params.id,
    data: request.body,
  });

  return reply.success({ data: { prompt }, message: 'Prompt saved' });
}
