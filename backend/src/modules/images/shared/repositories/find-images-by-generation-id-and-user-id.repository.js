import { and, asc, eq } from 'drizzle-orm';
import { images } from '#src/modules/images/image.table.js';

export async function findImagesByGenerationIdAndUserIdRepository({
  db,
  generationId,
  userId,
}) {
  return db
    .select()
    .from(images)
    .where(
      and(eq(images.generationId, generationId), eq(images.userId, userId)),
    )
    .orderBy(asc(images.createdAt));
}
