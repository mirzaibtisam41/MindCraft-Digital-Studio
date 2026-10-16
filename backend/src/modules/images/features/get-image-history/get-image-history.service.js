import { NotFoundError } from '#src/utils/index.js';
import { findUserImageByIdRepository } from '#src/modules/images/shared/repositories/index.js';
import { presentImageService } from '#src/modules/images/shared/services/index.js';
import { findUserGenerationByIdRepository } from '#src/modules/generations/shared/repositories/index.js';

const MAX_STEPS = 50;

export async function getImageHistoryService({ db, storage, userId, id }) {
  const steps = [];
  const visitedIds = new Set();
  let imageId = id;

  while (imageId && !visitedIds.has(imageId) && steps.length < MAX_STEPS) {
    visitedIds.add(imageId);

    const image = await findUserImageByIdRepository({
      db,
      id: imageId,
      userId,
    });

    if (!image) break;

    const generation = image.generationId
      ? await findUserGenerationByIdRepository({
          db,
          id: image.generationId,
          userId,
        })
      : null;

    steps.unshift({
      image: await presentImageService({ storage, image }),
      generation: generation
        ? {
            id: generation.id,
            type: generation.type,
            prompt: generation.prompt,
            totalCredits: generation.totalCredits,
            createdAt: generation.createdAt,
          }
        : null,
    });

    imageId = generation?.sourceImageId ?? null;
  }

  if (steps.length === 0) {
    throw new NotFoundError('Image not found');
  }

  return steps;
}
