import { forgotPasswordController } from './features/forgot-password/forgot-password.controller.js';
import { forgotPasswordBodySchema } from './features/forgot-password/forgot-password.schema.js';
import { loginController } from './features/login/login.controller.js';
import { loginBodySchema } from './features/login/login.schema.js';
import { logoutController } from './features/logout/logout.controller.js';
import { refreshSessionController } from './features/refresh-session/refresh-session.controller.js';
import { registerController } from './features/register/register.controller.js';
import { registerBodySchema } from './features/register/register.schema.js';
import { resetPasswordController } from './features/reset-password/reset-password.controller.js';
import { resetPasswordBodySchema } from './features/reset-password/reset-password.schema.js';

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
}
