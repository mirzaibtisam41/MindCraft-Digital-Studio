import { NotFoundError } from '#src/utils/index.js';
import { deleteUserImageRepository } from '#src/modules/images/shared/repositories/index.js';

export async function deleteMyImageService({ db, storage, log, userId, id }) {
  const image = await deleteUserImageRepository({ db, id, userId });

  if (!image) {
    throw new NotFoundError('Image not found');
  }

  try {
    await storage.deleteFile({ key: image.storageKey });
  } catch (error) {
    log.error(
      { err: error, storageKey: image.storageKey },
      'Image row deleted but its file could not be removed from storage',
    );
  }
}
