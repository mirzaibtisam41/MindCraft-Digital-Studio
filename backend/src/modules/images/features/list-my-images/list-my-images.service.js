import { listUserImagesRepository } from '#src/modules/images/shared/repositories/index.js';
import { presentImageService } from '#src/modules/images/shared/services/index.js';

const SINCE_DAYS = { '7d': 7, '30d': 30 };

export async function listMyImagesService({ db, storage, userId, query }) {
  const { page, limit } = query;

  const { images, total } = await listUserImagesRepository({
    db,
    filters: {
      userId,
      source: query.source,
      modelId: query.modelId,
      since: query.since
        ? new Date(Date.now() - SINCE_DAYS[query.since] * 24 * 60 * 60 * 1000)
        : null,
      favorite: query.favorite,
      search: query.search?.trim(),
    },
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
