import {
  checkUserIsAdminHook,
  checkUserIsLoggedInHook,
} from '#src/hooks/index.js';
import { listModelCreditPricesController } from './features/list-model-credit-prices/list-model-credit-prices.controller.js';
import { listModelCreditPricesParamsSchema } from './features/list-model-credit-prices/list-model-credit-prices.schema.js';
import { saveWorkflowCreditPricesController } from './features/save-workflow-credit-prices/save-workflow-credit-prices.controller.js';
import {
  saveWorkflowCreditPricesBodySchema,
  saveWorkflowCreditPricesParamsSchema,
} from './features/save-workflow-credit-prices/save-workflow-credit-prices.schema.js';

export function aiModelCreditPricesRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);
  fastify.addHook('onRequest', checkUserIsAdminHook);

  fastify.get(
    '/:modelId/prices',
    { schema: { params: listModelCreditPricesParamsSchema } },
    listModelCreditPricesController,
  );

  fastify.put(
    '/:modelId/generation-types/:typeId/prices',
    {
      schema: {
        params: saveWorkflowCreditPricesParamsSchema,
        body: saveWorkflowCreditPricesBodySchema,
      },
    },
    saveWorkflowCreditPricesController,
  );
}
