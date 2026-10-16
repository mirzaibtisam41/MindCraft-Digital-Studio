import { images } from '#src/modules/images/image.table.js';

export const IMAGE_COLUMNS = {
  id: images.id,
  source: images.source,
  generationId: images.generationId,
  storageKey: images.storageKey,
  thumbnailKey: images.thumbnailKey,
  contentType: images.contentType,
  width: images.width,
  height: images.height,
  sizeBytes: images.sizeBytes,
  originalFileName: images.originalFileName,
  isFavorite: images.isFavorite,
  createdAt: images.createdAt,
};
