import { listGenerationImagesRepository } from '#src/modules/images/shared/repositories/index.js';
import { presentImageService } from '#src/modules/images/shared/services/index.js';

export async function presentGenerationsService({ db, storage, generations }) {
  if (generations.length === 0) return [];

  const images = await listGenerationImagesRepository({
    db,
    generationIds: generations.map((generation) => generation.id),
  });
  const presentedImages = await Promise.all(
    images.map((image) => presentImageService({ storage, image })),
  );

  return generations.map((generation) => ({
    ...generation,
    images: presentedImages.filter(
      (image) => image.generationId === generation.id,
    ),
  }));
}
