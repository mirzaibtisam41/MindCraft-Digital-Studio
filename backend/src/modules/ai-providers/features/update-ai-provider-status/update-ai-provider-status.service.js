import { NotFoundError } from '#src/utils/index.js';
import { updateAiProviderRepository } from '#src/modules/ai-providers/shared/repositories/index.js';

export async function updateAiProviderStatusService({ db, id, isActive }) {
  const provider = await updateAiProviderRepository({
    db,
    id,
    data: { isActive },
  });

  if (!provider) {
    throw new NotFoundError('Provider not found');
  }

  return provider;
}
