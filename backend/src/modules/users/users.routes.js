import {
  checkUserIsAdminHook,
  checkUserIsLoggedInHook,
} from '#src/hooks/index.js';
import { uuidParamsSchema } from '#src/shared/schemas/uuid-params.schema.js';
import { getUserController } from '#src/modules/users/features/get-user/get-user.controller.js';
import { listUsersController } from '#src/modules/users/features/list-users/list-users.controller.js';
import { listUsersQuerySchema } from '#src/modules/users/features/list-users/list-users.schema.js';

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
}
