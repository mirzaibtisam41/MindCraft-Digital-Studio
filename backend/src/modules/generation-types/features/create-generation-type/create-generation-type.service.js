import { ConflictError, isUniqueViolationErrorUtil } from '#src/utils/index.js';
import { createGenerationTypeRepository } from '#src/modules/generation-types/shared/repositories/index.js';

export async function createGenerationTypeService({ db, data }) {
  try {
    return await createGenerationTypeRepository({
      db,
      data: {
        code: data.code.trim().toLowerCase(),
        name: data.name.trim(),
        description: data.description?.trim() || null,
        isActive: data.isActive,
      },
    });
  } catch (error) {
    if (isUniqueViolationErrorUtil({ error })) {
      throw new ConflictError(
        'A generation type with this code already exists',
      );
    }

    throw error;
  }
}
