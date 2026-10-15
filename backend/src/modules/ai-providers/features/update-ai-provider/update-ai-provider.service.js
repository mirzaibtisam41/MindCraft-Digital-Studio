import { NotFoundError } from '#src/utils/index.js';
import { updateAiProviderRepository } from '#src/modules/ai-providers/shared/repositories/index.js';

export async function updateAiProviderService({ db, id, data }) {
  const provider = await updateAiProviderRepository({
    db,
    id,
    data: { name: data.name.trim() },
  });

  if (!provider) {
    throw new NotFoundError('Provider not found');
  }

  return provider;
}
