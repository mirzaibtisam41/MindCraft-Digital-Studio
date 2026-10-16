import { NotFoundError } from '#src/utils/index.js';
import { updateUserPromptRepository } from '#src/modules/prompts/shared/repositories/index.js';

export async function updateMyPromptService({ db, userId, id, data }) {
  const changes = { ...data };

  if (changes.title !== undefined) changes.title = changes.title.trim();
  if (changes.text !== undefined) changes.text = changes.text.trim();

  const prompt = await updateUserPromptRepository({
    db,
    id,
    userId,
    data: changes,
  });

  if (!prompt) {
    throw new NotFoundError('Prompt not found');
  }

  return prompt;
}
