import { randomUUID } from 'node:crypto';
import { buildStorageKey } from '#src/modules/storage/shared/utils/index.js';
import * as imageRepositories from '#src/modules/images/shared/repositories/index.js';
import { normalizeImageMetadataService } from './normalize-image-metadata.service.js';

async function removeSavedFiles({ fastify, storageKeys }) {
  await Promise.allSettled(
    storageKeys.map((key) => fastify.storage.remove({ key })),
  );
}

export async function saveGeneratedImagesService({
  fastify,
  userId,
  generationId,
  images,
  size,
  outputFormat,
}) {
  const storageKeys = [];

  try {
    const savedImages = [];

    for (const image of images) {
      const imageId = randomUUID();
      const storageKey = buildStorageKey({
        userId,
        generationId,
        imageId,
        extension: outputFormat,
      });
      const metadata = normalizeImageMetadataService({ image, size });

      await fastify.storage.save({
        key: storageKey,
        body: image.data,
        contentType: metadata.contentType,
      });
      storageKeys.push(storageKey);

      const record = await imageRepositories.insertImageRepository({
        db: fastify.db,
        data: { id: imageId, userId, generationId, storageKey, ...metadata },
      });
      savedImages.push(record);
    }

    return savedImages;
  } catch (error) {
    await removeSavedFiles({ fastify, storageKeys });
    throw error;
  }
}
