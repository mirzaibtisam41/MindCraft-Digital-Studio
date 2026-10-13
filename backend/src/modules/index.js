import { authRoutes } from './auth/auth.routes.js';
import { healthRoutes } from './health/health.routes.js';

export async function registerRoutes(fastify) {
  await fastify.register(healthRoutes, { prefix: '/health' });
  await fastify.register(authRoutes, { prefix: '/api/auth' });
}
