import { and, count, desc, eq, ilike } from 'drizzle-orm';
import { escapeLikePatternUtil } from '#src/utils/index.js';
import { generations } from '#src/modules/generations/generation.table.js';
import { aiModels } from '#src/modules/ai-models/ai-model.table.js';
import { GENERATION_WITH_MODEL_COLUMNS } from '#src/modules/generations/generation-columns.constants.js';

function buildFilters({ userId, modelId, search }) {
  const conditions = [eq(generations.userId, userId)];

  if (modelId) conditions.push(eq(generations.modelId, modelId));

  if (search) {
    conditions.push(
      ilike(generations.prompt, `%${escapeLikePatternUtil({ text: search })}%`),
    );
  }

  return conditions;
}

export async function listUserGenerationsRepository({
  db,
  filters,
  limit,
  offset,
}) {
  const conditions = buildFilters(filters);
  const where = and(
    ...conditions,
    filters.status ? eq(generations.status, filters.status) : undefined,
  );

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

  const statusRows = await db
    .select({ status: generations.status, total: count() })
    .from(generations)
    .where(and(...conditions))
    .groupBy(generations.status);

  return { generations: generationList, total, statusRows };
}
