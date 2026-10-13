import { loginController } from './features/login/login.controller.js';
import { loginBodySchema } from './features/login/login.schema.js';
import { registerController } from './features/register/register.controller.js';
import { registerBodySchema } from './features/register/register.schema.js';

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
}
