import { images } from '#src/modules/images/image.table.js';

export const IMAGE_COLUMNS = {
  id: images.id,
  source: images.source,
  storageKey: images.storageKey,
  contentType: images.contentType,
  width: images.width,
  height: images.height,
  sizeBytes: images.sizeBytes,
  originalFileName: images.originalFileName,
  createdAt: images.createdAt,
};
