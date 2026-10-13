import { NotFoundError } from '#src/utils/index.js';
import { AI_PROVIDER_NOT_FOUND_MESSAGE } from '#src/modules/ai-providers/ai-provider.constants.js';
import { updateAiProviderRepository } from '#src/modules/ai-providers/shared/repositories/index.js';

export async function updateAiProviderStatusService({ db, id, isActive }) {
  const provider = await updateAiProviderRepository({
    db,
    id,
    data: { isActive },
  });

  if (!provider) {
    throw new NotFoundError(AI_PROVIDER_NOT_FOUND_MESSAGE);
  }

  return provider;
}
