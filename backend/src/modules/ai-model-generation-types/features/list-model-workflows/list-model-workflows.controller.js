import { listModelWorkflowsService } from './list-model-workflows.service.js';

export async function listModelWorkflowsController(request, reply) {
  const { workflows, availableOptions } = await listModelWorkflowsService({
    db: request.server.db,
    modelId: request.params.modelId,
  });

  return reply.success({ data: { workflows, availableOptions } });
}
