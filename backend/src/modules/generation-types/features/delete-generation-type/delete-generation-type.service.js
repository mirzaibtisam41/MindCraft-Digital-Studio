import {
  ConflictError,
  NotFoundError,
  isForeignKeyViolationErrorUtil,
} from '#src/utils/index.js';
import { deleteGenerationTypeRepository } from '#src/modules/generation-types/shared/repositories/index.js';

export async function deleteGenerationTypeService({ db, id }) {
  try {
    const deletedType = await deleteGenerationTypeRepository({ db, id });

    if (!deletedType) {
      throw new NotFoundError('Generation type not found');
    }
  } catch (error) {
    if (isForeignKeyViolationErrorUtil({ error })) {
      throw new ConflictError(
        'This generation type is used by models and cannot be deleted. Turn it off instead.',
      );
    }

    throw error;
  }
}
