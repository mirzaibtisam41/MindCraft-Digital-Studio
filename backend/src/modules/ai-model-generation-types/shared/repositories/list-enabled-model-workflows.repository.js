import { and, eq } from 'drizzle-orm';
import { aiModelGenerationTypes } from '#src/modules/ai-model-generation-types/ai-model-generation-type.table.js';
import { generationTypes } from '#src/modules/generation-types/generation-type.table.js';

export function listEnabledModelWorkflowsRepository({ db, modelId }) {
  return db
    .select({
      id: aiModelGenerationTypes.id,
      name: generationTypes.name,
      enabledOptions: aiModelGenerationTypes.enabledOptions,
    })
    .from(aiModelGenerationTypes)
    .innerJoin(
      generationTypes,
      eq(generationTypes.id, aiModelGenerationTypes.generationTypeId),
    )
    .where(
      and(
        eq(aiModelGenerationTypes.modelId, modelId),
        eq(aiModelGenerationTypes.isEnabled, true),
      ),
    );
}
