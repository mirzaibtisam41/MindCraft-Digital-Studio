import { saveModelWorkflowService } from './save-model-workflow.service.js';

export async function saveModelWorkflowController(request, reply) {
  const workflow = await saveModelWorkflowService({
    db: request.server.db,
    modelId: request.params.modelId,
    typeId: request.params.typeId,
    data: request.body,
  });

  return reply.success({ data: { workflow }, message: 'Workflow saved' });
}
