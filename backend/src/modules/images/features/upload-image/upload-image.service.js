import { randomUUID } from 'node:crypto';
import { imageSize } from 'image-size';
import { BadRequestError } from '#src/utils/index.js';
import {
  IMAGE_ORIGINAL_FILE_NAME_MAX_LENGTH,
  IMAGE_SOURCE,
} from '#src/modules/images/image.constants.js';
import { createImageRepository } from '#src/modules/images/shared/repositories/index.js';
import { presentImageService } from '#src/modules/images/shared/services/index.js';
import { buildImageStorageKeyUtil } from '#src/modules/images/shared/utils/index.js';

const SUPPORTED_TYPES = {
  png: { contentType: 'image/png', extension: 'png' },
  jpg: { contentType: 'image/jpeg', extension: 'jpg' },
  webp: { contentType: 'image/webp', extension: 'webp' },
};

function readImageDetails({ fileBuffer }) {
  try {
    const { type, width, height } = imageSize(fileBuffer);

    return SUPPORTED_TYPES[type] && width > 0 && height > 0
      ? { ...SUPPORTED_TYPES[type], width, height }
      : null;
  } catch {
    return null;
  }
}

export async function uploadImageService({
  db,
  storage,
  log,
  userId,
  fileBuffer,
  fileName,
}) {
  const details = readImageDetails({ fileBuffer });

  if (!details) {
    throw new BadRequestError('Use a PNG, JPG or WebP image');
  }

  const imageId = randomUUID();
  const storageKey = buildImageStorageKeyUtil({
    userId,
    source: IMAGE_SOURCE.UPLOAD,
    imageId,
    extension: details.extension,
  });

  await storage.uploadFile({
    key: storageKey,
    body: fileBuffer,
    contentType: details.contentType,
  });

  let image;

  try {
    image = await createImageRepository({
      db,
      data: {
        id: imageId,
        userId,
        source: IMAGE_SOURCE.UPLOAD,
        storageKey,
        contentType: details.contentType,
        width: details.width,
        height: details.height,
        sizeBytes: fileBuffer.length,
        originalFileName:
          fileName?.slice(0, IMAGE_ORIGINAL_FILE_NAME_MAX_LENGTH) || null,
      },
    });
  } catch (error) {
    await storage.deleteFile({ key: storageKey }).catch((deleteError) => {
      log.error(
        { err: deleteError, storageKey },
        'Image row was not saved and its file could not be removed from storage',
      );
    });
    throw error;
  }

  return presentImageService({ storage, image });
}
