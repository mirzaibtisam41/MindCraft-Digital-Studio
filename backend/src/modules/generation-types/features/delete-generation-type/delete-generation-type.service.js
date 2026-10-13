import {
  ConflictError,
  NotFoundError,
  isForeignKeyViolationErrorUtil,
} from '#src/utils/index.js';
import {
  GENERATION_TYPE_IN_USE_MESSAGE,
  GENERATION_TYPE_NOT_FOUND_MESSAGE,
} from '#src/modules/generation-types/generation-type.constants.js';
import { deleteGenerationTypeRepository } from '#src/modules/generation-types/shared/repositories/index.js';

export async function deleteGenerationTypeService({ db, id }) {
  try {
    const deletedType = await deleteGenerationTypeRepository({ db, id });

    if (!deletedType) {
      throw new NotFoundError(GENERATION_TYPE_NOT_FOUND_MESSAGE);
    }
  } catch (error) {
    if (isForeignKeyViolationErrorUtil({ error })) {
      throw new ConflictError(GENERATION_TYPE_IN_USE_MESSAGE);
    }

    throw error;
  }
}
