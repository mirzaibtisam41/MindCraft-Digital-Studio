import { and, asc, eq } from 'drizzle-orm';
import { modelWorkflows } from '#src/modules/model-workflows/model-workflow.table.js';
import { generationTypes } from '#src/modules/generation-types/generation-type.table.js';

export async function listModelWorkflowsRepository({ db, modelId }) {
  const rows = await db
    .select({
      generationType: {
        id: generationTypes.id,
        code: generationTypes.code,
        name: generationTypes.name,
        description: generationTypes.description,
        isActive: generationTypes.isActive,
      },
      isEnabled: modelWorkflows.isEnabled,
      enabledOptions: modelWorkflows.enabledOptions,
      defaultOptions: modelWorkflows.defaultOptions,
      updatedAt: modelWorkflows.updatedAt,
    })
    .from(generationTypes)
    .leftJoin(
      modelWorkflows,
      and(
        eq(modelWorkflows.generationTypeId, generationTypes.id),
        eq(modelWorkflows.modelId, modelId),
      ),
    )
    .orderBy(asc(generationTypes.name));

  return rows.map((row) => ({ ...row, isEnabled: row.isEnabled ?? false }));
}
