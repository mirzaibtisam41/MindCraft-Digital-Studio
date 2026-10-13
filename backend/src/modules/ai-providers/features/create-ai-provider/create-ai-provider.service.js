import { ConflictError, isUniqueViolationErrorUtil } from '#src/utils/index.js';
import { AI_PROVIDER_CODE_TAKEN_MESSAGE } from '#src/modules/ai-providers/ai-provider.constants.js';
import {
  createAiProviderRepository,
  findAiProviderByCodeRepository,
} from '#src/modules/ai-providers/shared/repositories/index.js';

export async function createAiProviderService({ db, data }) {
  const code = data.code.trim().toLowerCase();

  const existingProvider = await findAiProviderByCodeRepository({ db, code });

  if (existingProvider) {
    throw new ConflictError(AI_PROVIDER_CODE_TAKEN_MESSAGE);
  }

  try {
    return await createAiProviderRepository({
      db,
      data: { code, name: data.name.trim(), isActive: data.isActive },
    });
  } catch (error) {
    if (isUniqueViolationErrorUtil({ error })) {
      throw new ConflictError(AI_PROVIDER_CODE_TAKEN_MESSAGE);
    }

    throw error;
  }
}
