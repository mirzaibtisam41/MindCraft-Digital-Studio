import {
  checkUserIsLoggedInHook,
  requireSuperAdminHook,
} from '#src/hooks/index.js';
import { idParamsSchema } from '#src/modules/admin/shared/schemas/id-params.schema.js';
import { adjustUserCreditsController } from './features/adjust-user-credits/adjust-user-credits.controller.js';
import { adjustUserCreditsBodySchema } from './features/adjust-user-credits/adjust-user-credits.schema.js';
import { createImageModelController } from './features/create-image-model/create-image-model.controller.js';
import { createImageModelBodySchema } from './features/create-image-model/create-image-model.schema.js';
import { getGenerationController } from './features/get-generation/get-generation.controller.js';
import { getOverviewController } from './features/get-overview/get-overview.controller.js';
import { getOverviewQuerySchema } from './features/get-overview/get-overview.schema.js';
import { getSettingsController } from './features/get-settings/get-settings.controller.js';
import { getUserController } from './features/get-user/get-user.controller.js';
import { listAuditLogsController } from './features/list-audit-logs/list-audit-logs.controller.js';
import { listAuditLogsQuerySchema } from './features/list-audit-logs/list-audit-logs.schema.js';
import { listGenerationsController } from './features/list-generations/list-generations.controller.js';
import { listGenerationsQuerySchema } from './features/list-generations/list-generations.schema.js';
import { listImageModelsController } from './features/list-image-models/list-image-models.controller.js';
import { listUserCreditTransactionsController } from './features/list-user-credit-transactions/list-user-credit-transactions.controller.js';
import { listUserCreditTransactionsQuerySchema } from './features/list-user-credit-transactions/list-user-credit-transactions.schema.js';
import { listUsersController } from './features/list-users/list-users.controller.js';
import { listUsersQuerySchema } from './features/list-users/list-users.schema.js';
import { updateImageModelController } from './features/update-image-model/update-image-model.controller.js';
import {
  updateImageModelBodySchema,
  updateImageModelParamsSchema,
} from './features/update-image-model/update-image-model.schema.js';
import { updateSettingsController } from './features/update-settings/update-settings.controller.js';
import { updateSettingsBodySchema } from './features/update-settings/update-settings.schema.js';
import { updateUserController } from './features/update-user/update-user.controller.js';
import { updateUserBodySchema } from './features/update-user/update-user.schema.js';

export function adminRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);
  fastify.addHook('onRequest', requireSuperAdminHook);

  fastify.get(
    '/overview',
    { schema: { querystring: getOverviewQuerySchema } },
    getOverviewController,
  );

  fastify.get('/models', listImageModelsController);

  fastify.post(
    '/models',
    { schema: { body: createImageModelBodySchema } },
    createImageModelController,
  );

  fastify.patch(
    '/models/:id',
    {
      schema: {
        params: updateImageModelParamsSchema,
        body: updateImageModelBodySchema,
      },
    },
    updateImageModelController,
  );

  fastify.get(
    '/users',
    { schema: { querystring: listUsersQuerySchema } },
    listUsersController,
  );

  fastify.get(
    '/users/:id',
    { schema: { params: idParamsSchema } },
    getUserController,
  );

  fastify.patch(
    '/users/:id',
    { schema: { params: idParamsSchema, body: updateUserBodySchema } },
    updateUserController,
  );

  fastify.post(
    '/users/:id/credits',
    { schema: { params: idParamsSchema, body: adjustUserCreditsBodySchema } },
    adjustUserCreditsController,
  );

  fastify.get(
    '/users/:id/credit-transactions',
    {
      schema: {
        params: idParamsSchema,
        querystring: listUserCreditTransactionsQuerySchema,
      },
    },
    listUserCreditTransactionsController,
  );

  fastify.get(
    '/generations',
    { schema: { querystring: listGenerationsQuerySchema } },
    listGenerationsController,
  );

  fastify.get(
    '/generations/:id',
    { schema: { params: idParamsSchema } },
    getGenerationController,
  );

  fastify.get(
    '/audit-logs',
    { schema: { querystring: listAuditLogsQuerySchema } },
    listAuditLogsController,
  );

  fastify.get('/settings', getSettingsController);

  fastify.patch(
    '/settings',
    { schema: { body: updateSettingsBodySchema } },
    updateSettingsController,
  );
}
