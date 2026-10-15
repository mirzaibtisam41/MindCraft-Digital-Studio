import { and, eq } from 'drizzle-orm';
import { modelWorkflows } from '#src/modules/model-workflows/model-workflow.table.js';
import { generationTypes } from '#src/modules/generation-types/generation-type.table.js';

export function listEnabledModelWorkflowsRepository({ db, modelId }) {
  return db
    .select({
      id: modelWorkflows.id,
      name: generationTypes.name,
      enabledOptions: modelWorkflows.enabledOptions,
    })
    .from(modelWorkflows)
    .innerJoin(
      generationTypes,
      eq(generationTypes.id, modelWorkflows.generationTypeId),
    )
    .where(
      and(
        eq(modelWorkflows.modelId, modelId),
        eq(modelWorkflows.isEnabled, true),
      ),
    );
}
