import {
  checkUserIsAdminHook,
  checkUserIsLoggedInHook,
} from '#src/hooks/index.js';
import { uuidParamsSchema } from '#src/shared/schemas/uuid-params.schema.js';
import { listModelCreditPricesController } from '#src/modules/ai-model-credit-prices/features/list-model-credit-prices/list-model-credit-prices.controller.js';
import { saveWorkflowCreditPricesController } from '#src/modules/ai-model-credit-prices/features/save-workflow-credit-prices/save-workflow-credit-prices.controller.js';
import { saveWorkflowCreditPricesBodySchema } from '#src/modules/ai-model-credit-prices/features/save-workflow-credit-prices/save-workflow-credit-prices.schema.js';

export function aiModelCreditPricesRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);
  fastify.addHook('onRequest', checkUserIsAdminHook);

  fastify.get(
    '/:modelId/prices',
    { schema: { params: uuidParamsSchema('modelId') } },
    listModelCreditPricesController,
  );

  fastify.put(
    '/:modelId/workflows/:typeId/prices',
    {
      schema: {
        params: uuidParamsSchema('modelId', 'typeId'),
        body: saveWorkflowCreditPricesBodySchema,
      },
    },
    saveWorkflowCreditPricesController,
  );
}
