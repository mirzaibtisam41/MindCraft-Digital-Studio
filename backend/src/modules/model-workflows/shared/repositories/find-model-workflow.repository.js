import { and, eq } from 'drizzle-orm';
import { modelWorkflows } from '#src/modules/model-workflows/model-workflow.table.js';

export async function findModelWorkflowRepository({
  db,
  modelId,
  generationTypeId,
}) {
  const [workflow] = await db
    .select({
      id: modelWorkflows.id,
      isEnabled: modelWorkflows.isEnabled,
      enabledOptions: modelWorkflows.enabledOptions,
    })
    .from(modelWorkflows)
    .where(
      and(
        eq(modelWorkflows.modelId, modelId),
        eq(modelWorkflows.generationTypeId, generationTypeId),
      ),
    )
    .limit(1);

  return workflow ?? null;
}
