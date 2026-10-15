import {
  ConflictError,
  NotFoundError,
  isForeignKeyViolationErrorUtil,
} from '#src/utils/index.js';
import { deleteAiProviderRepository } from '#src/modules/ai-providers/shared/repositories/index.js';

export async function deleteAiProviderService({ db, id }) {
  try {
    const deletedProvider = await deleteAiProviderRepository({ db, id });

    if (!deletedProvider) {
      throw new NotFoundError('Provider not found');
    }
  } catch (error) {
    if (isForeignKeyViolationErrorUtil({ error })) {
      throw new ConflictError(
        'This provider has models and cannot be deleted. Deactivate it instead.',
      );
    }

    throw error;
  }
}
