import { count, desc, eq } from 'drizzle-orm';
import { generations } from '#src/modules/generations/generation.table.js';
import { aiModels } from '#src/modules/ai-models/ai-model.table.js';
import { GENERATION_WITH_MODEL_COLUMNS } from '#src/modules/generations/generation-columns.constants.js';

export async function listUserGenerationsRepository({
  db,
  userId,
  limit,
  offset,
}) {
  const where = eq(generations.userId, userId);

  const generationList = await db
    .select(GENERATION_WITH_MODEL_COLUMNS)
    .from(generations)
    .innerJoin(aiModels, eq(aiModels.id, generations.modelId))
    .where(where)
    .orderBy(desc(generations.createdAt), desc(generations.id))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(generations)
    .where(where);

  return { generations: generationList, total };
}
