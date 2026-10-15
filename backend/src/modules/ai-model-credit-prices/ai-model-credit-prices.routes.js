import {
  checkUserIsAdminHook,
  checkUserIsLoggedInHook,
} from '#src/hooks/index.js';
import { uuidParamsSchema } from '#src/shared/schemas/uuid-params.schema.js';
import { listModelCreditPricesController } from './features/list-model-credit-prices/list-model-credit-prices.controller.js';
import { saveWorkflowCreditPricesController } from './features/save-workflow-credit-prices/save-workflow-credit-prices.controller.js';
import { saveWorkflowCreditPricesBodySchema } from './features/save-workflow-credit-prices/save-workflow-credit-prices.schema.js';

export function aiModelCreditPricesRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);
  fastify.addHook('onRequest', checkUserIsAdminHook);

  fastify.get(
    '/:modelId/prices',
    { schema: { params: uuidParamsSchema('modelId') } },
    listModelCreditPricesController,
  );

  fastify.put(
    '/:modelId/generation-types/:typeId/prices',
    {
      schema: {
        params: uuidParamsSchema('modelId', 'typeId'),
        body: saveWorkflowCreditPricesBodySchema,
      },
    },
    saveWorkflowCreditPricesController,
  );
}
