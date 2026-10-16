import { and, asc, eq } from 'drizzle-orm';
import { modelWorkflows } from '#src/modules/model-workflows/model-workflow.table.js';
import { generationTypes } from '#src/modules/generation-types/generation-type.table.js';
import { aiModels } from '#src/modules/ai-models/ai-model.table.js';
import { aiProviders } from '#src/modules/ai-providers/ai-provider.table.js';
import { AI_MODEL_STATUS } from '#src/modules/ai-models/ai-model.constants.js';

export function listAvailableModelWorkflowsRepository({
  db,
  generationTypeCode,
}) {
  return db
    .select({
      id: modelWorkflows.id,
      enabledOptions: modelWorkflows.enabledOptions,
      defaultOptions: modelWorkflows.defaultOptions,
      model: {
        id: aiModels.id,
        name: aiModels.name,
        description: aiModels.description,
      },
      provider: { name: aiProviders.name },
    })
    .from(modelWorkflows)
    .innerJoin(
      generationTypes,
      eq(generationTypes.id, modelWorkflows.generationTypeId),
    )
    .innerJoin(aiModels, eq(aiModels.id, modelWorkflows.modelId))
    .innerJoin(aiProviders, eq(aiProviders.id, aiModels.providerId))
    .where(
      and(
        eq(modelWorkflows.isEnabled, true),
        eq(generationTypes.code, generationTypeCode),
        eq(generationTypes.isActive, true),
        eq(aiModels.status, AI_MODEL_STATUS.ACTIVE),
        eq(aiProviders.isActive, true),
      ),
    )
    .orderBy(asc(aiModels.sortOrder), asc(aiModels.name));
}
