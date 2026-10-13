import { NotFoundError } from '#src/utils/index.js';
import { AI_PROVIDER_NOT_FOUND_MESSAGE } from '#src/modules/ai-providers/ai-provider.constants.js';
import { findAiProviderByIdRepository } from '#src/modules/ai-providers/shared/repositories/index.js';

export async function getAiProviderService({ db, id }) {
  const provider = await findAiProviderByIdRepository({ db, id });

  if (!provider) {
    throw new NotFoundError(AI_PROVIDER_NOT_FOUND_MESSAGE);
  }

  return provider;
}
