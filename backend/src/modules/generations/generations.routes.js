import { checkUserIsLoggedInHook } from '#src/hooks/index.js';
import { uuidParamsSchema } from '#src/shared/schemas/uuid-params.schema.js';
import { createGenerationController } from '#src/modules/generations/features/create-generation/create-generation.controller.js';
import { createGenerationBodySchema } from '#src/modules/generations/features/create-generation/create-generation.schema.js';
import { getGenerationOptionsController } from '#src/modules/generations/features/get-generation-options/get-generation-options.controller.js';
import { getGenerationOptionsQuerySchema } from '#src/modules/generations/features/get-generation-options/get-generation-options.schema.js';
import { getMyGenerationController } from '#src/modules/generations/features/get-my-generation/get-my-generation.controller.js';
import { listMyGenerationsController } from '#src/modules/generations/features/list-my-generations/list-my-generations.controller.js';
import { listMyGenerationsQuerySchema } from '#src/modules/generations/features/list-my-generations/list-my-generations.schema.js';

export function generationsRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);

  fastify.get(
    '/options',
    { schema: { querystring: getGenerationOptionsQuerySchema } },
    getGenerationOptionsController,
  );

  fastify.post(
    '/',
    {
      schema: { body: createGenerationBodySchema },
      bodyLimit: 12 * 1024 * 1024,
    },
    createGenerationController,
  );

  fastify.get(
    '/',
    { schema: { querystring: listMyGenerationsQuerySchema } },
    listMyGenerationsController,
  );

  fastify.get(
    '/:id',
    { schema: { params: uuidParamsSchema('id') } },
    getMyGenerationController,
  );
}
