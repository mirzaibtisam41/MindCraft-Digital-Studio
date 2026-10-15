import { listModelWorkflowsService } from '#src/modules/model-workflows/features/list-model-workflows/list-model-workflows.service.js';

export async function listModelWorkflowsController(request, reply) {
  const { workflows, availableOptions } = await listModelWorkflowsService({
    db: request.server.db,
    modelId: request.params.modelId,
  });

  return reply.success({ data: { workflows, availableOptions } });
}
