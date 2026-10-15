import { NotFoundError } from '#src/utils/index.js';
import { updateGenerationTypeRepository } from '#src/modules/generation-types/shared/repositories/index.js';

export async function updateGenerationTypeStatusService({ db, id, isActive }) {
  const generationType = await updateGenerationTypeRepository({
    db,
    id,
    data: { isActive },
  });

  if (!generationType) {
    throw new NotFoundError('Generation type not found');
  }

  return generationType;
}
