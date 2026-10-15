import {
  checkUserIsAdminHook,
  checkUserIsLoggedInHook,
} from '#src/hooks/index.js';
import { uuidParamsSchema } from '#src/shared/schemas/uuid-params.schema.js';
import { getUserController } from '#src/modules/users/features/get-user/get-user.controller.js';
import { listUsersController } from '#src/modules/users/features/list-users/list-users.controller.js';
import { listUsersQuerySchema } from '#src/modules/users/features/list-users/list-users.schema.js';
import { updateUserRoleController } from '#src/modules/users/features/update-user-role/update-user-role.controller.js';
import { updateUserRoleBodySchema } from '#src/modules/users/features/update-user-role/update-user-role.schema.js';
import { updateUserStatusController } from '#src/modules/users/features/update-user-status/update-user-status.controller.js';
import { updateUserStatusBodySchema } from '#src/modules/users/features/update-user-status/update-user-status.schema.js';

export function adminUsersRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);
  fastify.addHook('onRequest', checkUserIsAdminHook);

  fastify.get(
    '/',
    { schema: { querystring: listUsersQuerySchema } },
    listUsersController,
  );

  fastify.get(
    '/:userId',
    { schema: { params: uuidParamsSchema('userId') } },
    getUserController,
  );

  fastify.patch(
    '/:userId/status',
    {
      schema: {
        params: uuidParamsSchema('userId'),
        body: updateUserStatusBodySchema,
      },
    },
    updateUserStatusController,
  );

  fastify.patch(
    '/:userId/role',
    {
      schema: {
        params: uuidParamsSchema('userId'),
        body: updateUserRoleBodySchema,
      },
    },
    updateUserRoleController,
  );
}
