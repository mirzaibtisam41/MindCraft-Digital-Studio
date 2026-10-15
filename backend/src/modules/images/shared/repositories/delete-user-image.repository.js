import { and, eq } from 'drizzle-orm';
import { images } from '#src/modules/images/image.table.js';
import { IMAGE_COLUMNS } from '#src/modules/images/image-columns.constants.js';

export async function deleteUserImageRepository({ db, id, userId }) {
  const [image] = await db
    .delete(images)
    .where(and(eq(images.id, id), eq(images.userId, userId)))
    .returning(IMAGE_COLUMNS);

  return image ?? null;
}
