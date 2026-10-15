import {
  checkUserIsAdminHook,
  checkUserIsLoggedInHook,
} from '#src/hooks/index.js';
import { uuidParamsSchema } from '#src/shared/schemas/uuid-params.schema.js';
import { createAiProviderController } from './features/create-ai-provider/create-ai-provider.controller.js';
import { createAiProviderBodySchema } from './features/create-ai-provider/create-ai-provider.schema.js';
import { deleteAiProviderController } from './features/delete-ai-provider/delete-ai-provider.controller.js';
import { getAiProviderController } from './features/get-ai-provider/get-ai-provider.controller.js';
import { listAiProvidersController } from './features/list-ai-providers/list-ai-providers.controller.js';
import { updateAiProviderController } from './features/update-ai-provider/update-ai-provider.controller.js';
import { updateAiProviderBodySchema } from './features/update-ai-provider/update-ai-provider.schema.js';
import { updateAiProviderStatusController } from './features/update-ai-provider-status/update-ai-provider-status.controller.js';
import { updateAiProviderStatusBodySchema } from './features/update-ai-provider-status/update-ai-provider-status.schema.js';

export function aiProvidersRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);
  fastify.addHook('onRequest', checkUserIsAdminHook);

  fastify.post(
    '/',
    { schema: { body: createAiProviderBodySchema } },
    createAiProviderController,
  );

  fastify.get('/', listAiProvidersController);

  fastify.get(
    '/:id',
    { schema: { params: uuidParamsSchema('id') } },
    getAiProviderController,
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        params: uuidParamsSchema('id'),
        body: updateAiProviderBodySchema,
      },
    },
    updateAiProviderController,
  );

  fastify.patch(
    '/:id/status',
    {
      schema: {
        params: uuidParamsSchema('id'),
        body: updateAiProviderStatusBodySchema,
      },
    },
    updateAiProviderStatusController,
  );

  fastify.delete(
    '/:id',
    { schema: { params: uuidParamsSchema('id') } },
    deleteAiProviderController,
  );
}
