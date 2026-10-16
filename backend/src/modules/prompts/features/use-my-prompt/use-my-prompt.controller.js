import { NotFoundError } from '#src/utils/index.js';
import { markPromptUsedRepository } from '#src/modules/prompts/shared/repositories/index.js';

export async function useMyPromptController(request, reply) {
  const prompt = await markPromptUsedRepository({
    db: request.server.db,
    id: request.params.id,
    userId: request.user.id,
  });

  if (!prompt) {
    throw new NotFoundError('Prompt not found');
  }

  return reply.success({ data: { prompt } });
}
