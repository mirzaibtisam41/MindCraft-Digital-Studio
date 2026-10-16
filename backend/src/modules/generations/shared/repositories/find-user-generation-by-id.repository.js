import { and, eq } from 'drizzle-orm';
import { generations } from '#src/modules/generations/generation.table.js';
import { aiModels } from '#src/modules/ai-models/ai-model.table.js';
import { GENERATION_WITH_MODEL_COLUMNS } from '#src/modules/generations/generation-columns.constants.js';

export async function findUserGenerationByIdRepository({ db, id, userId }) {
  const [generation] = await db
    .select(GENERATION_WITH_MODEL_COLUMNS)
    .from(generations)
    .innerJoin(aiModels, eq(aiModels.id, generations.modelId))
    .where(and(eq(generations.id, id), eq(generations.userId, userId)))
    .limit(1);

  return generation ?? null;
}
