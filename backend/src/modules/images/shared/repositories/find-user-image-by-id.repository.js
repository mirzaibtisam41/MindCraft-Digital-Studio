import { and, eq } from 'drizzle-orm';
import { images } from '#src/modules/images/image.table.js';
import { IMAGE_COLUMNS } from '#src/modules/images/image-columns.constants.js';

export async function findUserImageByIdRepository({ db, id, userId }) {
  const [image] = await db
    .select(IMAGE_COLUMNS)
    .from(images)
    .where(and(eq(images.id, id), eq(images.userId, userId)))
    .limit(1);

  return image ?? null;
}
