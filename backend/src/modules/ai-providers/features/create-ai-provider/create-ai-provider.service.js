import { ConflictError, isUniqueViolationErrorUtil } from '#src/utils/index.js';
import { createAiProviderRepository } from '#src/modules/ai-providers/shared/repositories/index.js';

export async function createAiProviderService({ db, data }) {
  try {
    return await createAiProviderRepository({
      db,
      data: {
        code: data.code.trim().toLowerCase(),
        name: data.name.trim(),
        isActive: data.isActive,
      },
    });
  } catch (error) {
    if (isUniqueViolationErrorUtil({ error })) {
      throw new ConflictError('A provider with this code already exists');
    }

    throw error;
  }
}
