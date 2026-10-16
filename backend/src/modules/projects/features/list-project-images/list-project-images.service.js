import { listProjectImagesRepository } from '#src/modules/projects/shared/repositories/index.js';
import { findOwnedProjectService } from '#src/modules/projects/shared/services/index.js';
import { presentImageService } from '#src/modules/images/shared/services/index.js';

export async function listProjectImagesService({
  db,
  storage,
  userId,
  projectId,
  query,
}) {
  await findOwnedProjectService({ db, userId, projectId });

  const { page, limit } = query;
  const { images, total } = await listProjectImagesRepository({
    db,
    projectId,
    collectionId: query.collectionId,
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
