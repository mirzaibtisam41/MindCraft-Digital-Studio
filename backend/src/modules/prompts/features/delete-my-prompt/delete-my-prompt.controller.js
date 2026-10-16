import { NotFoundError } from '#src/utils/index.js';
import { deleteUserPromptRepository } from '#src/modules/prompts/shared/repositories/index.js';

export async function deleteMyPromptController(request, reply) {
  const deleted = await deleteUserPromptRepository({
    db: request.server.db,
    id: request.params.id,
    userId: request.user.id,
  });

  if (!deleted) {
    throw new NotFoundError('Prompt not found');
  }

  return reply.success({ message: 'Prompt deleted' });
}
