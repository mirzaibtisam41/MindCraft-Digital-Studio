import { and, count, desc, eq, gte, ilike, or } from 'drizzle-orm';
import { escapeLikePatternUtil } from '#src/utils/index.js';
import { images } from '#src/modules/images/image.table.js';
import { generations } from '#src/modules/generations/generation.table.js';
import { aiModels } from '#src/modules/ai-models/ai-model.table.js';
import { IMAGE_WITH_GENERATION_COLUMNS } from '#src/modules/images/image-columns.constants.js';

function buildFilters({ userId, source, modelId, since, favorite, search }) {
  const conditions = [eq(images.userId, userId)];

  if (source) conditions.push(eq(images.source, source));
  if (modelId) conditions.push(eq(generations.modelId, modelId));
  if (since) conditions.push(gte(images.createdAt, since));
  if (favorite) conditions.push(eq(images.isFavorite, true));

  if (search) {
    const pattern = `%${escapeLikePatternUtil({ text: search })}%`;

    conditions.push(
      or(
        ilike(generations.prompt, pattern),
        ilike(images.originalFileName, pattern),
      ),
    );
  }

  return and(...conditions);
}

export async function listUserImagesRepository({ db, filters, limit, offset }) {
  const where = buildFilters(filters);

  const imageList = await db
    .select(IMAGE_WITH_GENERATION_COLUMNS)
    .from(images)
    .leftJoin(generations, eq(generations.id, images.generationId))
    .leftJoin(aiModels, eq(aiModels.id, generations.modelId))
    .where(where)
    .orderBy(desc(images.createdAt), desc(images.id))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(images)
    .leftJoin(generations, eq(generations.id, images.generationId))
    .where(where);

  return { images: imageList, total };
}
