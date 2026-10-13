import { aiModelsRoutes } from './ai-models/ai-models.routes.js';
import { aiProvidersRoutes } from './ai-providers/ai-providers.routes.js';
import { authRoutes } from './auth/auth.routes.js';
import { healthRoutes } from './health/health.routes.js';

export async function registerRoutes(fastify) {
  await fastify.register(healthRoutes, { prefix: '/health' });
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(aiProvidersRoutes, { prefix: '/api/admin/providers' });
  await fastify.register(aiModelsRoutes, { prefix: '/api/admin/models' });
}
