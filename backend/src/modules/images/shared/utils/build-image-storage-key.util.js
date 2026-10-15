import { IMAGE_SOURCE } from '#src/modules/images/image.constants.js';

const SOURCE_FOLDERS = {
  [IMAGE_SOURCE.UPLOAD]: 'uploads',
  [IMAGE_SOURCE.GENERATED]: 'generations',
  [IMAGE_SOURCE.EDITED]: 'edits',
};

export function buildImageStorageKeyUtil({
  userId,
  source,
  imageId,
  extension,
}) {
  return `users/${userId}/${SOURCE_FOLDERS[source]}/${imageId}.${extension}`;
}
