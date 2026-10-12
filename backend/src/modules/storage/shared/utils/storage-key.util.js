import { IMAGE_OUTPUT_FORMAT } from '#src/constants/index.js';

const UUID_PATTERN =
  '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const EXTENSION_PATTERN = Object.values(IMAGE_OUTPUT_FORMAT).join('|');

const STORAGE_KEY_REGEX = new RegExp(
  `^${UUID_PATTERN}/${UUID_PATTERN}/${UUID_PATTERN}\\.(${EXTENSION_PATTERN})$`,
);

export function buildStorageKey({ userId, generationId, imageId, extension }) {
  const key = `${userId}/${generationId}/${imageId}.${extension}`;

  assertValidStorageKey(key);

  return key;
}

export function assertValidStorageKey(key) {
  if (typeof key !== 'string' || !STORAGE_KEY_REGEX.test(key)) {
    throw new Error('Invalid storage key');
  }
}
