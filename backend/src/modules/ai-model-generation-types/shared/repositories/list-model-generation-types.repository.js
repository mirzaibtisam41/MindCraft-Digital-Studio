import { and, asc, eq } from 'drizzle-orm';
import { aiModelGenerationTypes } from '#src/modules/ai-model-generation-types/ai-model-generation-type.table.js';
import { generationTypes } from '#src/modules/generation-types/generation-type.table.js';

export async function listModelGenerationTypesRepository({ db, modelId }) {
  const rows = await db
    .select({
      generationType: {
        id: generationTypes.id,
        code: generationTypes.code,
        name: generationTypes.name,
        description: generationTypes.description,
        isActive: generationTypes.isActive,
      },
      isEnabled: aiModelGenerationTypes.isEnabled,
      enabledOptions: aiModelGenerationTypes.enabledOptions,
      defaultOptions: aiModelGenerationTypes.defaultOptions,
      updatedAt: aiModelGenerationTypes.updatedAt,
    })
    .from(generationTypes)
    .leftJoin(
      aiModelGenerationTypes,
      and(
        eq(aiModelGenerationTypes.generationTypeId, generationTypes.id),
        eq(aiModelGenerationTypes.modelId, modelId),
      ),
    )
    .orderBy(asc(generationTypes.name));

  return rows.map((row) => ({ ...row, isEnabled: row.isEnabled ?? false }));
}
