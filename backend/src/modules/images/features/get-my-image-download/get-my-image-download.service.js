import { NotFoundError } from '#src/utils/index.js';
import { findUserImageByIdRepository } from '#src/modules/images/shared/repositories/index.js';

const EXTENSIONS = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

function buildDownloadFileName(image) {
  if (image.originalFileName) {
    return image.originalFileName.replace(/["\\\r\n]/g, '');
  }

  return `mindcraft-${image.id.slice(0, 8)}.${EXTENSIONS[image.contentType] ?? 'png'}`;
}

export async function getMyImageDownloadService({ db, storage, userId, id }) {
  const image = await findUserImageByIdRepository({ db, id, userId });

  if (!image) {
    throw new NotFoundError('Image not found');
  }

  return storage.createSignedUrl({
    key: image.storageKey,
    downloadFileName: buildDownloadFileName(image),
  });
}
