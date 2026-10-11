import { checkUserIsLoggedInHook } from '#src/hooks/index.js';
import { changePasswordController } from './features/changePassword/change-password.controller.js';
import { changePasswordBodySchema } from './features/changePassword/change-password.schema.js';
import { getMyProfileController } from './features/getMyProfile/get-my-profile.controller.js';
import { updateMyProfileController } from './features/updateMyProfile/update-my-profile.controller.js';
import { updateMyProfileBodySchema } from './features/updateMyProfile/update-my-profile.schema.js';

export function usersRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);

  fastify.get('/', getMyProfileController);

  fastify.patch(
    '/',
    { schema: { body: updateMyProfileBodySchema } },
    updateMyProfileController,
  );

  fastify.patch(
    '/password',
    {
      schema: { body: changePasswordBodySchema },
      config: { rateLimit: { max: 10, timeWindow: '15 minutes' } },
    },
    changePasswordController,
  );
}
