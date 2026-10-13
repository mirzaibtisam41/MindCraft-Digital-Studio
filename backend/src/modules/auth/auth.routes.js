import { checkUserIsLoggedInHook } from '#src/hooks/index.js';
import { getMeController } from './features/get-me/get-me.controller.js';
import { listSessionsController } from './features/list-sessions/list-sessions.controller.js';
import { loginController } from './features/login/login.controller.js';
import { loginBodySchema } from './features/login/login.schema.js';
import { logoutController } from './features/logout/logout.controller.js';
import { logoutOtherSessionsController } from './features/logout-other-sessions/logout-other-sessions.controller.js';
import { refreshSessionController } from './features/refresh-session/refresh-session.controller.js';
import { registerController } from './features/register/register.controller.js';
import { registerBodySchema } from './features/register/register.schema.js';
import { revokeSessionController } from './features/revoke-session/revoke-session.controller.js';
import { revokeSessionParamsSchema } from './features/revoke-session/revoke-session.schema.js';

export function authRoutes(fastify) {
  fastify.post(
    '/register',
    {
      schema: { body: registerBodySchema },
      config: { rateLimit: { max: 10, timeWindow: '1 hour' } },
    },
    registerController,
  );

  fastify.post(
    '/login',
    {
      schema: { body: loginBodySchema },
      config: { rateLimit: { max: 10, timeWindow: '15 minutes' } },
    },
    loginController,
  );

  fastify.post(
    '/refresh',
    { config: { rateLimit: { max: 60, timeWindow: '15 minutes' } } },
    refreshSessionController,
  );

  fastify.post('/logout', logoutController);

  fastify.get('/me', { onRequest: [checkUserIsLoggedInHook] }, getMeController);

  fastify.get(
    '/sessions',
    { onRequest: [checkUserIsLoggedInHook] },
    listSessionsController,
  );

  fastify.delete(
    '/sessions/:familyId',
    {
      onRequest: [checkUserIsLoggedInHook],
      schema: { params: revokeSessionParamsSchema },
    },
    revokeSessionController,
  );

  fastify.post(
    '/logout-others',
    { onRequest: [checkUserIsLoggedInHook] },
    logoutOtherSessionsController,
  );
}
