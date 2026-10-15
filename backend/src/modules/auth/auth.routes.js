import { checkUserIsLoggedInHook } from '#src/hooks/index.js';
import { uuidParamsSchema } from '#src/shared/schemas/uuid-params.schema.js';
import { getMeController } from '#src/modules/auth/features/get-me/get-me.controller.js';
import { listSessionsController } from '#src/modules/auth/features/list-sessions/list-sessions.controller.js';
import { loginController } from '#src/modules/auth/features/login/login.controller.js';
import { loginBodySchema } from '#src/modules/auth/features/login/login.schema.js';
import { logoutController } from '#src/modules/auth/features/logout/logout.controller.js';
import { logoutOtherSessionsController } from '#src/modules/auth/features/logout-other-sessions/logout-other-sessions.controller.js';
import { refreshSessionController } from '#src/modules/auth/features/refresh-session/refresh-session.controller.js';
import { registerController } from '#src/modules/auth/features/register/register.controller.js';
import { registerBodySchema } from '#src/modules/auth/features/register/register.schema.js';
import { revokeSessionController } from '#src/modules/auth/features/revoke-session/revoke-session.controller.js';

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
      schema: { params: uuidParamsSchema('familyId') },
    },
    revokeSessionController,
  );

  fastify.post(
    '/logout-others',
    { onRequest: [checkUserIsLoggedInHook] },
    logoutOtherSessionsController,
  );
}
