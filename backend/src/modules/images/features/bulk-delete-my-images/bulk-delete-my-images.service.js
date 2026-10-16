import { deleteUserImagesRepository } from '#src/modules/images/shared/repositories/index.js';
import { deleteImageFilesService } from '#src/modules/images/shared/services/index.js';

export async function bulkDeleteMyImagesService({
  db,
  storage,
  log,
  userId,
  ids,
}) {
  const deletedImages = await deleteUserImagesRepository({ db, ids, userId });

  await deleteImageFilesService({
    storage,
    log,
    keys: deletedImages.flatMap((image) => [
      image.storageKey,
      image.thumbnailKey,
    ]),
  });

  return deletedImages.map((image) => image.id);
}
