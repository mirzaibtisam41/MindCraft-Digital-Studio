import {
  checkUserIsAdminHook,
  checkUserIsLoggedInHook,
} from '#src/hooks/index.js';
import { listModelWorkflowsController } from './features/list-model-workflows/list-model-workflows.controller.js';
import { listModelWorkflowsParamsSchema } from './features/list-model-workflows/list-model-workflows.schema.js';
import { saveModelWorkflowController } from './features/save-model-workflow/save-model-workflow.controller.js';
import {
  saveModelWorkflowBodySchema,
  saveModelWorkflowParamsSchema,
} from './features/save-model-workflow/save-model-workflow.schema.js';

export function aiModelGenerationTypesRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);
  fastify.addHook('onRequest', checkUserIsAdminHook);

  fastify.get(
    '/:modelId/generation-types',
    { schema: { params: listModelWorkflowsParamsSchema } },
    listModelWorkflowsController,
  );

  fastify.put(
    '/:modelId/generation-types/:typeId',
    {
      schema: {
        params: saveModelWorkflowParamsSchema,
        body: saveModelWorkflowBodySchema,
      },
    },
    saveModelWorkflowController,
  );
}
