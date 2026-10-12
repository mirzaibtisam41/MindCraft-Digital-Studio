import { adminRoutes } from './admin/admin.routes.js';
import { authRoutes } from './auth/auth.routes.js';
import { generationsRoutes } from './generations/generations.routes.js';
import { healthRoutes } from './health/health.routes.js';
import { imagesRoutes } from './images/images.routes.js';
import { userSettingsRoutes } from './user-settings/user-settings.routes.js';
import { usersRoutes } from './users/users.routes.js';

export async function registerRoutes(fastify) {
  await fastify.register(adminRoutes, { prefix: '/api/admin' });
  await fastify.register(healthRoutes, { prefix: '/health' });
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(usersRoutes, { prefix: '/api/me' });
  await fastify.register(userSettingsRoutes, { prefix: '/api/me/settings' });
  await fastify.register(imagesRoutes, { prefix: '/api/images' });
  await fastify.register(generationsRoutes, { prefix: '/api/images' });
}
