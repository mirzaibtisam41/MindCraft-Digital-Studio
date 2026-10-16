import { and, eq, inArray } from 'drizzle-orm';
import { images } from '#src/modules/images/image.table.js';

export async function listUserImageIdsRepository({ db, userId, ids }) {
  const ownedImages = await db
    .select({ id: images.id })
    .from(images)
    .where(and(inArray(images.id, ids), eq(images.userId, userId)));

  return ownedImages.map((image) => image.id);
}
