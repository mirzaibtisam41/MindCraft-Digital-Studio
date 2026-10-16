import { NotFoundError } from '#src/utils/index.js';
import { findUserGenerationByIdRepository } from '#src/modules/generations/shared/repositories/index.js';
import { presentGenerationsService } from '#src/modules/generations/shared/services/index.js';

export async function getMyGenerationService({ db, storage, userId, id }) {
  const generation = await findUserGenerationByIdRepository({ db, id, userId });

  if (!generation) {
    throw new NotFoundError('Generation not found');
  }

  const [presented] = await presentGenerationsService({
    db,
    storage,
    generations: [generation],
  });

  return presented;
}
