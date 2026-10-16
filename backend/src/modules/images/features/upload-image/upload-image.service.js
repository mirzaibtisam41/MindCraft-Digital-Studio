import { randomUUID } from 'node:crypto';
import { BadRequestError } from '#src/utils/index.js';
import {
  IMAGE_ORIGINAL_FILE_NAME_MAX_LENGTH,
  IMAGE_SOURCE,
} from '#src/modules/images/image.constants.js';
import { createImageRepository } from '#src/modules/images/shared/repositories/index.js';
import {
  deleteImageFilesService,
  presentImageService,
  uploadImageFilesService,
} from '#src/modules/images/shared/services/index.js';
import { readImageDetailsUtil } from '#src/modules/images/shared/utils/index.js';

export async function uploadImageService({
  db,
  storage,
  log,
  userId,
  fileBuffer,
  fileName,
}) {
  const details = readImageDetailsUtil({ fileBuffer });

  if (!details) {
    throw new BadRequestError('Use a PNG, JPG or WebP image');
  }

  const imageId = randomUUID();
  const { storageKey, thumbnailKey } = await uploadImageFilesService({
    storage,
    userId,
    source: IMAGE_SOURCE.UPLOAD,
    imageId,
    fileBuffer,
    details,
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
        thumbnailKey,
        contentType: details.contentType,
        width: details.width,
        height: details.height,
        sizeBytes: fileBuffer.length,
        originalFileName:
          fileName?.slice(0, IMAGE_ORIGINAL_FILE_NAME_MAX_LENGTH) || null,
      },
    });
  } catch (error) {
    await deleteImageFilesService({
      storage,
      log,
      keys: [storageKey, thumbnailKey],
    });
    throw error;
  }

  return presentImageService({ storage, image });
}
