import { NotFoundError } from '#src/utils/index.js';
import { updateGenerationTypeRepository } from '#src/modules/generation-types/shared/repositories/index.js';

export async function updateGenerationTypeService({ db, id, data }) {
  const changes = {};

  if (data.name !== undefined) changes.name = data.name.trim();
  if (data.description !== undefined) {
    changes.description = data.description?.trim() || null;
  }

  const generationType = await updateGenerationTypeRepository({
    db,
    id,
    data: changes,
  });

  if (!generationType) {
    throw new NotFoundError('Generation type not found');
  }

  return generationType;
}
