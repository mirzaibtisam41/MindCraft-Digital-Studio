import { listUserImagesRepository } from '#src/modules/images/shared/repositories/index.js';
import { presentImageService } from '#src/modules/images/shared/services/index.js';

export async function listMyImagesService({ db, storage, userId, query }) {
  const { page, limit } = query;

  const { images, total } = await listUserImagesRepository({
    db,
    userId,
    source: query.source,
    limit,
    offset: (page - 1) * limit,
  });

  return {
    images: await Promise.all(
      images.map((image) => presentImageService({ storage, image })),
    ),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
