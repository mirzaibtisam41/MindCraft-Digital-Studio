import { NotFoundError } from '#src/utils/index.js';
import { deleteUserImageRepository } from '#src/modules/images/shared/repositories/index.js';
import { deleteImageFilesService } from '#src/modules/images/shared/services/index.js';

export async function deleteMyImageService({ db, storage, log, userId, id }) {
  const image = await deleteUserImageRepository({ db, id, userId });

  if (!image) {
    throw new NotFoundError('Image not found');
  }

  await deleteImageFilesService({
    storage,
    log,
    keys: [image.storageKey, image.thumbnailKey],
  });
}
