import { listModelCreditPricesService } from './list-model-credit-prices.service.js';

export async function listModelCreditPricesController(request, reply) {
  const prices = await listModelCreditPricesService({
    db: request.server.db,
    modelId: request.params.modelId,
  });

  return reply.success({ data: { prices } });
}
