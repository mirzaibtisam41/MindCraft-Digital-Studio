import { NotFoundError } from '#src/utils/index.js';
import * as generationRepositories from '#src/modules/generations/shared/repositories/index.js';
import * as imageRepositories from '#src/modules/images/shared/repositories/index.js';
import { presentGenerationService } from '#src/modules/generations/shared/services/index.js';

export async function getGenerationService({
  db,
  storage,
  userId,
  generationId,
}) {
  const generation =
    await generationRepositories.findGenerationByIdAndUserIdRepository({
      db,
      id: generationId,
      userId,
    });

  if (!generation) {
    throw new NotFoundError('Generation not found');
  }

  const images =
    await imageRepositories.findImagesByGenerationIdAndUserIdRepository({
      db,
      generationId,
      userId,
    });

  return presentGenerationService({ storage, generation, images });
}
