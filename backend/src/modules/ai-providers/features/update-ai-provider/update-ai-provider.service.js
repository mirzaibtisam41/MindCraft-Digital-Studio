import {
  ConflictError,
  NotFoundError,
  isUniqueViolationErrorUtil,
} from '#src/utils/index.js';
import {
  AI_PROVIDER_CODE_TAKEN_MESSAGE,
  AI_PROVIDER_NOT_FOUND_MESSAGE,
} from '#src/modules/ai-providers/ai-provider.constants.js';
import {
  findAiProviderByCodeRepository,
  updateAiProviderRepository,
} from '#src/modules/ai-providers/shared/repositories/index.js';

export async function updateAiProviderService({ db, id, data }) {
  const changes = {};

  if (data.name !== undefined) changes.name = data.name.trim();
  if (data.code !== undefined) changes.code = data.code.trim().toLowerCase();

  if (changes.code) {
    const providerWithSameCode = await findAiProviderByCodeRepository({
      db,
      code: changes.code,
    });

    if (providerWithSameCode && providerWithSameCode.id !== id) {
      throw new ConflictError(AI_PROVIDER_CODE_TAKEN_MESSAGE);
    }
  }

  try {
    const provider = await updateAiProviderRepository({
      db,
      id,
      data: changes,
    });

    if (!provider) {
      throw new NotFoundError(AI_PROVIDER_NOT_FOUND_MESSAGE);
    }

    return provider;
  } catch (error) {
    if (isUniqueViolationErrorUtil({ error })) {
      throw new ConflictError(AI_PROVIDER_CODE_TAKEN_MESSAGE);
    }

    throw error;
  }
}
