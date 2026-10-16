import { and, eq, inArray } from 'drizzle-orm';
import { images } from '#src/modules/images/image.table.js';

export async function updateUserImagesFavoriteRepository({
  db,
  ids,
  userId,
  isFavorite,
}) {
  const updatedImages = await db
    .update(images)
    .set({ isFavorite })
    .where(and(inArray(images.id, ids), eq(images.userId, userId)))
    .returning({ id: images.id });

  return updatedImages.map((image) => image.id);
}
