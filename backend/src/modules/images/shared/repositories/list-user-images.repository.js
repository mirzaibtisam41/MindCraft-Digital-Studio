import { and, count, desc, eq } from 'drizzle-orm';
import { images } from '#src/modules/images/image.table.js';
import { IMAGE_COLUMNS } from '#src/modules/images/image-columns.constants.js';

export async function listUserImagesRepository({
  db,
  userId,
  source,
  limit,
  offset,
}) {
  const where = and(
    eq(images.userId, userId),
    source ? eq(images.source, source) : undefined,
  );

  const imageList = await db
    .select(IMAGE_COLUMNS)
    .from(images)
    .where(where)
    .orderBy(desc(images.createdAt), desc(images.id))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(images)
    .where(where);

  return { images: imageList, total };
}
