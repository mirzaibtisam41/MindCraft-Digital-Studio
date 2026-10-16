import {
  buildImageStorageKeyUtil,
  buildThumbnailStorageKeyUtil,
  createThumbnailUtil,
} from '#src/modules/images/shared/utils/index.js';

export async function uploadImageFilesService({
  storage,
  userId,
  source,
  imageId,
  fileBuffer,
  details,
}) {
  const storageKey = buildImageStorageKeyUtil({
    userId,
    source,
    imageId,
    extension: details.extension,
  });
  const thumbnailKey = buildThumbnailStorageKeyUtil({ userId, imageId });
  const thumbnailBuffer = await createThumbnailUtil({ fileBuffer });

  await storage.uploadFile({
    key: storageKey,
    body: fileBuffer,
    contentType: details.contentType,
  });

  try {
    await storage.uploadFile({
      key: thumbnailKey,
      body: thumbnailBuffer,
      contentType: 'image/webp',
    });
  } catch (error) {
    await storage.deleteFile({ key: storageKey }).catch(() => {});
    throw error;
  }

  return { storageKey, thumbnailKey };
}
