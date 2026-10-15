import { and, asc, count, eq, ilike, or } from 'drizzle-orm';
import { escapeLikePatternUtil } from '#src/utils/index.js';
import { aiModels } from '#src/modules/ai-models/ai-model.table.js';
import { aiProviders } from '#src/modules/ai-providers/ai-provider.table.js';
import { AI_MODEL_WITH_PROVIDER_COLUMNS } from '#src/modules/ai-models/ai-model-columns.constants.js';

function buildFilters({ search, providerId, status }) {
  const conditions = [];

  if (search) {
    const pattern = `%${escapeLikePatternUtil({ text: search })}%`;

    conditions.push(
      or(
        ilike(aiModels.name, pattern),
        ilike(aiModels.slug, pattern),
        ilike(aiModels.providerModelId, pattern),
      ),
    );
  }

  if (providerId) conditions.push(eq(aiModels.providerId, providerId));
  if (status) conditions.push(eq(aiModels.status, status));

  return and(...conditions);
}

export async function listAiModelsRepository({ db, filters, limit, offset }) {
  const where = buildFilters(filters);

  const models = await db
    .select(AI_MODEL_WITH_PROVIDER_COLUMNS)
    .from(aiModels)
    .innerJoin(aiProviders, eq(aiProviders.id, aiModels.providerId))
    .where(where)
    .orderBy(asc(aiModels.sortOrder), asc(aiModels.name))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(aiModels)
    .where(where);

  return { models, total };
}
