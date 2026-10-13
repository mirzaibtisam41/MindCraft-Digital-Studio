import {
  checkUserIsAdminHook,
  checkUserIsLoggedInHook,
} from '#src/hooks/index.js';
import { generationTypeIdParamsSchema } from './generation-type-id-params.schema.js';
import { listGenerationTypesController } from './features/list-generation-types/list-generation-types.controller.js';
import { updateGenerationTypeController } from './features/update-generation-type/update-generation-type.controller.js';
import { updateGenerationTypeBodySchema } from './features/update-generation-type/update-generation-type.schema.js';
import { updateGenerationTypeStatusController } from './features/update-generation-type-status/update-generation-type-status.controller.js';
import { updateGenerationTypeStatusBodySchema } from './features/update-generation-type-status/update-generation-type-status.schema.js';

export function generationTypesRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);
  fastify.addHook('onRequest', checkUserIsAdminHook);

  fastify.get('/', listGenerationTypesController);

  fastify.patch(
    '/:id',
    {
      schema: {
        params: generationTypeIdParamsSchema,
        body: updateGenerationTypeBodySchema,
      },
    },
    updateGenerationTypeController,
  );

  fastify.patch(
    '/:id/status',
    {
      schema: {
        params: generationTypeIdParamsSchema,
        body: updateGenerationTypeStatusBodySchema,
      },
    },
    updateGenerationTypeStatusController,
  );
}
