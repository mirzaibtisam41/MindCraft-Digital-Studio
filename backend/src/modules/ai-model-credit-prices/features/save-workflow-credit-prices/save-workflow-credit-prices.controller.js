import { saveWorkflowCreditPricesService } from '#src/modules/ai-model-credit-prices/features/save-workflow-credit-prices/save-workflow-credit-prices.service.js';

export async function saveWorkflowCreditPricesController(request, reply) {
  const prices = await saveWorkflowCreditPricesService({
    db: request.server.db,
    modelId: request.params.modelId,
    typeId: request.params.typeId,
    prices: request.body.prices,
    adminId: request.user.id,
  });

  return reply.success({ data: { prices }, message: 'Prices saved' });
}
