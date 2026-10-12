import { and, eq } from 'drizzle-orm';
import { images } from '#src/modules/images/image.table.js';

export async function findImageByIdAndUserIdRepository({ db, id, userId }) {
  const [image] = await db
    .select()
    .from(images)
    .where(and(eq(images.id, id), eq(images.userId, userId)))
    .limit(1);

  return image ?? null;
}
