import { NotFoundError } from '#src/utils/index.js';
import { findAiProviderByIdRepository } from '#src/modules/ai-providers/shared/repositories/index.js';

export async function getAiProviderService({ db, id }) {
  const provider = await findAiProviderByIdRepository({ db, id });

  if (!provider) {
    throw new NotFoundError('Provider not found');
  }

  return provider;
}
