import { checkUserIsLoggedInHook } from '#src/hooks/index.js';
import { getMyProfileController } from './features/get-my-profile/get-my-profile.controller.js';

export function usersRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);

  fastify.get('/', getMyProfileController);
}
