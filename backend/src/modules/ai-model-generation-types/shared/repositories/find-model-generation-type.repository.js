import { and, eq } from 'drizzle-orm';
import { aiModelGenerationTypes } from '#src/modules/ai-model-generation-types/ai-model-generation-type.table.js';

export async function findModelGenerationTypeRepository({
  db,
  modelId,
  generationTypeId,
}) {
  const [workflow] = await db
    .select({
      id: aiModelGenerationTypes.id,
      isEnabled: aiModelGenerationTypes.isEnabled,
      enabledOptions: aiModelGenerationTypes.enabledOptions,
    })
    .from(aiModelGenerationTypes)
    .where(
      and(
        eq(aiModelGenerationTypes.modelId, modelId),
        eq(aiModelGenerationTypes.generationTypeId, generationTypeId),
      ),
    )
    .limit(1);

  return workflow ?? null;
}
