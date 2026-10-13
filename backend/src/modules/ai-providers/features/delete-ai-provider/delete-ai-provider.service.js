import {
  ConflictError,
  NotFoundError,
  isForeignKeyViolationErrorUtil,
} from '#src/utils/index.js';
import {
  AI_PROVIDER_HAS_MODELS_MESSAGE,
  AI_PROVIDER_NOT_FOUND_MESSAGE,
} from '#src/modules/ai-providers/ai-provider.constants.js';
import { deleteAiProviderRepository } from '#src/modules/ai-providers/shared/repositories/index.js';

export async function deleteAiProviderService({ db, id }) {
  try {
    const deletedProvider = await deleteAiProviderRepository({ db, id });

    if (!deletedProvider) {
      throw new NotFoundError(AI_PROVIDER_NOT_FOUND_MESSAGE);
    }
  } catch (error) {
    if (isForeignKeyViolationErrorUtil({ error })) {
      throw new ConflictError(AI_PROVIDER_HAS_MODELS_MESSAGE);
    }

    throw error;
  }
}
