import { and, eq, inArray } from 'drizzle-orm';
import { images } from '#src/modules/images/image.table.js';

export function deleteUserImagesRepository({ db, ids, userId }) {
  return db
    .delete(images)
    .where(and(inArray(images.id, ids), eq(images.userId, userId)))
    .returning({
      id: images.id,
      storageKey: images.storageKey,
      thumbnailKey: images.thumbnailKey,
    });
}
