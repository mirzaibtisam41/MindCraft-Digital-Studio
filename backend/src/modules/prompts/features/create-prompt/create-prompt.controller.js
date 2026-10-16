import { StatusCodes } from 'http-status-codes';
import { createPromptRepository } from '#src/modules/prompts/shared/repositories/index.js';

export async function createPromptController(request, reply) {
  const prompt = await createPromptRepository({
    db: request.server.db,
    data: {
      userId: request.user.id,
      title: request.body.title.trim(),
      text: request.body.text.trim(),
      category: request.body.category,
      style: request.body.style ?? null,
    },
  });

  return reply.success({
    data: { prompt },
    message: 'Prompt saved',
    statusCode: StatusCodes.CREATED,
  });
}
