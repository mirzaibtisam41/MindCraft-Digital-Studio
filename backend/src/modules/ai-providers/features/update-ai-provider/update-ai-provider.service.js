import { NotFoundError } from '#src/utils/index.js';
import { AI_PROVIDER_NOT_FOUND_MESSAGE } from '#src/modules/ai-providers/ai-provider.constants.js';
import { updateAiProviderRepository } from '#src/modules/ai-providers/shared/repositories/index.js';

export async function updateAiProviderService({ db, id, data }) {
  const provider = await updateAiProviderRepository({
    db,
    id,
    data: { name: data.name.trim() },
  });

  if (!provider) {
    throw new NotFoundError(AI_PROVIDER_NOT_FOUND_MESSAGE);
  }

  return provider;
}
