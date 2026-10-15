import { modelWorkflows } from '#src/modules/model-workflows/model-workflow.table.js';

export async function saveModelWorkflowRepository({ db, data }) {
  const changes = {
    isEnabled: data.isEnabled,
    enabledOptions: data.enabledOptions,
    defaultOptions: data.defaultOptions,
    updatedAt: new Date(),
  };

  const [workflow] = await db
    .insert(modelWorkflows)
    .values(data)
    .onConflictDoUpdate({
      target: [modelWorkflows.modelId, modelWorkflows.generationTypeId],
      set: changes,
    })
    .returning({
      id: modelWorkflows.id,
      modelId: modelWorkflows.modelId,
      generationTypeId: modelWorkflows.generationTypeId,
      isEnabled: modelWorkflows.isEnabled,
      enabledOptions: modelWorkflows.enabledOptions,
      defaultOptions: modelWorkflows.defaultOptions,
      updatedAt: modelWorkflows.updatedAt,
    });

  return workflow;
}
