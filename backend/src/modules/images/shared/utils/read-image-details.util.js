import { imageSize } from 'image-size';

const SUPPORTED_TYPES = {
  png: { contentType: 'image/png', extension: 'png' },
  jpg: { contentType: 'image/jpeg', extension: 'jpg' },
  webp: { contentType: 'image/webp', extension: 'webp' },
};

export function readImageDetailsUtil({ fileBuffer }) {
  try {
    const { type, width, height } = imageSize(fileBuffer);

    return SUPPORTED_TYPES[type] && width > 0 && height > 0
      ? { ...SUPPORTED_TYPES[type], width, height }
      : null;
  } catch {
    return null;
  }
}
