import { eq } from 'drizzle-orm';
import { aiModels } from '#src/modules/ai-models/ai-model.table.js';
import { aiProviders } from '#src/modules/ai-providers/ai-provider.table.js';
import { AI_MODEL_WITH_PROVIDER_COLUMNS } from '#src/modules/ai-models/ai-model-columns.constants.js';

export async function findAiModelByIdRepository({ db, id }) {
  const [model] = await db
    .select(AI_MODEL_WITH_PROVIDER_COLUMNS)
    .from(aiModels)
    .innerJoin(aiProviders, eq(aiProviders.id, aiModels.providerId))
    .where(eq(aiModels.id, id))
    .limit(1);

  return model ?? null;
}
