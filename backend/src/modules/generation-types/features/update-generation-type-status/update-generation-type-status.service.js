import { NotFoundError } from '#src/utils/index.js';
import { GENERATION_TYPE_NOT_FOUND_MESSAGE } from '#src/modules/generation-types/generation-type.constants.js';
import { updateGenerationTypeRepository } from '#src/modules/generation-types/shared/repositories/index.js';

export async function updateGenerationTypeStatusService({ db, id, isActive }) {
  const generationType = await updateGenerationTypeRepository({
    db,
    id,
    data: { isActive },
  });

  if (!generationType) {
    throw new NotFoundError(GENERATION_TYPE_NOT_FOUND_MESSAGE);
  }

  return generationType;
}
