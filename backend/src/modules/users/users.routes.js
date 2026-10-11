import { checkUserIsLoggedInHook } from '#src/hooks/index.js';
import { changePasswordController } from './features/change-password/change-password.controller.js';
import { changePasswordBodySchema } from './features/change-password/change-password.schema.js';
import { getMyProfileController } from './features/get-my-profile/get-my-profile.controller.js';
import { updateMyProfileController } from './features/update-my-profile/update-my-profile.controller.js';
import { updateMyProfileBodySchema } from './features/update-my-profile/update-my-profile.schema.js';

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
