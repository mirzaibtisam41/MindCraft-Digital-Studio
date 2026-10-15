import {
  checkUserIsAdminHook,
  checkUserIsLoggedInHook,
} from '#src/hooks/index.js';
import { uuidParamsSchema } from '#src/shared/schemas/uuid-params.schema.js';
import { listModelWorkflowsController } from '#src/modules/model-workflows/features/list-model-workflows/list-model-workflows.controller.js';
import { saveModelWorkflowController } from '#src/modules/model-workflows/features/save-model-workflow/save-model-workflow.controller.js';
import { saveModelWorkflowBodySchema } from '#src/modules/model-workflows/features/save-model-workflow/save-model-workflow.schema.js';

export function modelWorkflowsRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);
  fastify.addHook('onRequest', checkUserIsAdminHook);

  fastify.get(
    '/:modelId/workflows',
    { schema: { params: uuidParamsSchema('modelId') } },
    listModelWorkflowsController,
  );

  fastify.put(
    '/:modelId/workflows/:typeId',
    {
      schema: {
        params: uuidParamsSchema('modelId', 'typeId'),
        body: saveModelWorkflowBodySchema,
      },
    },
    saveModelWorkflowController,
  );
}
