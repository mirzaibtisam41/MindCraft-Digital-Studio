import { ConflictError, isUniqueViolationErrorUtil } from '#src/utils/index.js';
import {
  createGenerationTypeRepository,
  findGenerationTypeByCodeRepository,
} from '#src/modules/generation-types/shared/repositories/index.js';

export async function createGenerationTypeService({ db, data }) {
  const code = data.code.trim().toLowerCase();

  const existingType = await findGenerationTypeByCodeRepository({ db, code });

  if (existingType) {
    throw new ConflictError('A generation type with this code already exists');
  }

  try {
    return await createGenerationTypeRepository({
      db,
      data: {
        code,
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
