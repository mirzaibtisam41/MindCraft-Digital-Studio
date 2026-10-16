import { eq, isNull } from 'drizzle-orm';
import { buildApp } from '#src/bootstrap/index.js';
import { images } from '#src/modules/images/image.table.js';
import {
  buildThumbnailStorageKeyUtil,
  createThumbnailUtil,
} from '#src/modules/images/shared/utils/index.js';

const app = buildApp();
await app.ready();

let createdCount = 0;
let failedCount = 0;

try {
  const imagesWithoutThumbnail = await app.db
    .select({
      id: images.id,
      userId: images.userId,
      storageKey: images.storageKey,
    })
    .from(images)
    .where(isNull(images.thumbnailKey));

  for (const image of imagesWithoutThumbnail) {
    try {
      const fileBuffer = await app.storage.downloadFile({
        key: image.storageKey,
      });
      const thumbnailKey = buildThumbnailStorageKeyUtil({
        userId: image.userId,
        imageId: image.id,
      });

      await app.storage.uploadFile({
        key: thumbnailKey,
        body: await createThumbnailUtil({ fileBuffer }),
        contentType: 'image/webp',
      });
      await app.db
        .update(images)
        .set({ thumbnailKey })
        .where(eq(images.id, image.id));
      createdCount += 1;
    } catch (error) {
      failedCount += 1;
      console.error(`Thumbnail failed for image ${image.id}: ${error.message}`);
    }
  }

  console.log(
    `Thumbnails created: ${createdCount}, failed: ${failedCount}, checked: ${imagesWithoutThumbnail.length}`,
  );
} finally {
  await app.close();
}
