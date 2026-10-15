import {
  checkUserIsAdminHook,
  checkUserIsLoggedInHook,
} from '#src/hooks/index.js';
import { uuidParamsSchema } from '#src/shared/schemas/uuid-params.schema.js';
import { createAiModelController } from './features/create-ai-model/create-ai-model.controller.js';
import { createAiModelBodySchema } from './features/create-ai-model/create-ai-model.schema.js';
import { getAiModelController } from './features/get-ai-model/get-ai-model.controller.js';
import { listAiModelsController } from './features/list-ai-models/list-ai-models.controller.js';
import { listAiModelsQuerySchema } from './features/list-ai-models/list-ai-models.schema.js';
import { updateAiModelController } from './features/update-ai-model/update-ai-model.controller.js';
import { updateAiModelBodySchema } from './features/update-ai-model/update-ai-model.schema.js';
import { updateAiModelStatusController } from './features/update-ai-model-status/update-ai-model-status.controller.js';
import { updateAiModelStatusBodySchema } from './features/update-ai-model-status/update-ai-model-status.schema.js';

export function aiModelsRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);
  fastify.addHook('onRequest', checkUserIsAdminHook);

  fastify.post(
    '/',
    { schema: { body: createAiModelBodySchema } },
    createAiModelController,
  );

  fastify.get(
    '/',
    { schema: { querystring: listAiModelsQuerySchema } },
    listAiModelsController,
  );

  fastify.get(
    '/:id',
    { schema: { params: uuidParamsSchema('id') } },
    getAiModelController,
  );

  fastify.patch(
    '/:id',
    {
      schema: { params: uuidParamsSchema('id'), body: updateAiModelBodySchema },
    },
    updateAiModelController,
  );

  fastify.patch(
    '/:id/status',
    {
      schema: {
        params: uuidParamsSchema('id'),
        body: updateAiModelStatusBodySchema,
      },
    },
    updateAiModelStatusController,
  );
}
