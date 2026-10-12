import { parseImageSizeUtil } from '#src/modules/generations/shared/utils/index.js';

export function normalizeImageMetadataService({ image, size }) {
  const { width, height } = parseImageSizeUtil(size);

  return {
    contentType: image.mimeType,
    width,
    height,
    sizeBytes: image.data.length,
  };
}
