import { aiModelGenerationTypes } from '#src/modules/ai-model-generation-types/ai-model-generation-type.table.js';

export async function saveModelGenerationTypeRepository({ db, data }) {
  const changes = {
    isEnabled: data.isEnabled,
    enabledOptions: data.enabledOptions,
    defaultOptions: data.defaultOptions,
    updatedAt: new Date(),
  };

  const [workflow] = await db
    .insert(aiModelGenerationTypes)
    .values(data)
    .onConflictDoUpdate({
      target: [
        aiModelGenerationTypes.modelId,
        aiModelGenerationTypes.generationTypeId,
      ],
      set: changes,
    })
    .returning({
      id: aiModelGenerationTypes.id,
      modelId: aiModelGenerationTypes.modelId,
      generationTypeId: aiModelGenerationTypes.generationTypeId,
      isEnabled: aiModelGenerationTypes.isEnabled,
      enabledOptions: aiModelGenerationTypes.enabledOptions,
      defaultOptions: aiModelGenerationTypes.defaultOptions,
      updatedAt: aiModelGenerationTypes.updatedAt,
    });

  return workflow;
}
