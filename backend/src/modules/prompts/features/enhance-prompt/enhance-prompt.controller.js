import { enhancePromptService } from '#src/modules/prompts/features/enhance-prompt/enhance-prompt.service.js';

export async function enhancePromptController(request, reply) {
  const enhanced = await enhancePromptService({
    server: request.server,
    log: request.log,
    data: request.body,
  });

  return reply.success({ data: enhanced, message: 'Prompt improved' });
}
