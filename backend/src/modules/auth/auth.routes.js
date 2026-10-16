import { checkUserIsLoggedInHook } from '#src/hooks/index.js';
import { uuidParamsSchema } from '#src/shared/schemas/uuid-params.schema.js';
import { forgotPasswordController } from '#src/modules/auth/features/forgot-password/forgot-password.controller.js';
import { forgotPasswordBodySchema } from '#src/modules/auth/features/forgot-password/forgot-password.schema.js';
import { getMeController } from '#src/modules/auth/features/get-me/get-me.controller.js';
import { listSessionsController } from '#src/modules/auth/features/list-sessions/list-sessions.controller.js';
import { loginController } from '#src/modules/auth/features/login/login.controller.js';
import { loginBodySchema } from '#src/modules/auth/features/login/login.schema.js';
import { logoutController } from '#src/modules/auth/features/logout/logout.controller.js';
import { logoutOtherSessionsController } from '#src/modules/auth/features/logout-other-sessions/logout-other-sessions.controller.js';
import { refreshSessionController } from '#src/modules/auth/features/refresh-session/refresh-session.controller.js';
import { registerController } from '#src/modules/auth/features/register/register.controller.js';
import { registerBodySchema } from '#src/modules/auth/features/register/register.schema.js';
import { resendVerificationController } from '#src/modules/auth/features/resend-verification/resend-verification.controller.js';
import { resetPasswordController } from '#src/modules/auth/features/reset-password/reset-password.controller.js';
import { resetPasswordBodySchema } from '#src/modules/auth/features/reset-password/reset-password.schema.js';
import { revokeSessionController } from '#src/modules/auth/features/revoke-session/revoke-session.controller.js';
import { verifyEmailController } from '#src/modules/auth/features/verify-email/verify-email.controller.js';
import { verifyEmailBodySchema } from '#src/modules/auth/features/verify-email/verify-email.schema.js';

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

  fastify.post(
    '/forgot-password',
    {
      schema: { body: forgotPasswordBodySchema },
      config: { rateLimit: { max: 5, timeWindow: '1 hour' } },
    },
    forgotPasswordController,
  );

  fastify.post(
    '/reset-password',
    {
      schema: { body: resetPasswordBodySchema },
      config: { rateLimit: { max: 10, timeWindow: '15 minutes' } },
    },
    resetPasswordController,
  );

  fastify.post(
    '/verify-email',
    {
      schema: { body: verifyEmailBodySchema },
      config: { rateLimit: { max: 20, timeWindow: '15 minutes' } },
    },
    verifyEmailController,
  );

  fastify.post(
    '/resend-verification',
    {
      onRequest: [checkUserIsLoggedInHook],
      config: { rateLimit: { max: 5, timeWindow: '1 hour' } },
    },
    resendVerificationController,
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
