import {
  checkUserIsAdminHook,
  checkUserIsLoggedInHook,
} from '#src/hooks/index.js';
import { uuidParamsSchema } from '#src/shared/schemas/uuid-params.schema.js';
import { createGenerationTypeController } from '#src/modules/generation-types/features/create-generation-type/create-generation-type.controller.js';
import { createGenerationTypeBodySchema } from '#src/modules/generation-types/features/create-generation-type/create-generation-type.schema.js';
import { deleteGenerationTypeController } from '#src/modules/generation-types/features/delete-generation-type/delete-generation-type.controller.js';
import { listGenerationTypesController } from '#src/modules/generation-types/features/list-generation-types/list-generation-types.controller.js';
import { updateGenerationTypeController } from '#src/modules/generation-types/features/update-generation-type/update-generation-type.controller.js';
import { updateGenerationTypeBodySchema } from '#src/modules/generation-types/features/update-generation-type/update-generation-type.schema.js';
import { updateGenerationTypeStatusController } from '#src/modules/generation-types/features/update-generation-type-status/update-generation-type-status.controller.js';
import { updateGenerationTypeStatusBodySchema } from '#src/modules/generation-types/features/update-generation-type-status/update-generation-type-status.schema.js';

export function generationTypesRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);
  fastify.addHook('onRequest', checkUserIsAdminHook);

  fastify.post(
    '/',
    { schema: { body: createGenerationTypeBodySchema } },
    createGenerationTypeController,
  );

  fastify.get('/', listGenerationTypesController);

  fastify.patch(
    '/:id',
    {
      schema: {
        params: uuidParamsSchema('id'),
        body: updateGenerationTypeBodySchema,
      },
    },
    updateGenerationTypeController,
  );

  fastify.patch(
    '/:id/status',
    {
      schema: {
        params: uuidParamsSchema('id'),
        body: updateGenerationTypeStatusBodySchema,
      },
    },
    updateGenerationTypeStatusController,
  );

  fastify.delete(
    '/:id',
    { schema: { params: uuidParamsSchema('id') } },
    deleteGenerationTypeController,
  );
}
