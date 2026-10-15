import {
  checkUserIsAdminHook,
  checkUserIsLoggedInHook,
} from '#src/hooks/index.js';
import { uuidParamsSchema } from '#src/shared/schemas/uuid-params.schema.js';
import { listModelWorkflowsController } from './features/list-model-workflows/list-model-workflows.controller.js';
import { saveModelWorkflowController } from './features/save-model-workflow/save-model-workflow.controller.js';
import { saveModelWorkflowBodySchema } from './features/save-model-workflow/save-model-workflow.schema.js';

export function aiModelGenerationTypesRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);
  fastify.addHook('onRequest', checkUserIsAdminHook);

  fastify.get(
    '/:modelId/generation-types',
    { schema: { params: uuidParamsSchema('modelId') } },
    listModelWorkflowsController,
  );

  fastify.put(
    '/:modelId/generation-types/:typeId',
    {
      schema: {
        params: uuidParamsSchema('modelId', 'typeId'),
        body: saveModelWorkflowBodySchema,
      },
    },
    saveModelWorkflowController,
  );
}
