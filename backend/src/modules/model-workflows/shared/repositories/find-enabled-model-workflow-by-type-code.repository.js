import { and, eq } from 'drizzle-orm';
import { modelWorkflows } from '#src/modules/model-workflows/model-workflow.table.js';
import { generationTypes } from '#src/modules/generation-types/generation-type.table.js';

export async function findEnabledModelWorkflowByTypeCodeRepository({
  db,
  modelId,
  generationTypeCode,
}) {
  const [workflow] = await db
    .select({
      id: modelWorkflows.id,
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
        eq(generationTypes.code, generationTypeCode),
        eq(generationTypes.isActive, true),
      ),
    )
    .limit(1);

  return workflow ?? null;
}
