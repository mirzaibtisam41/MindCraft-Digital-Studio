import { aiModelCreditPricesRoutes } from './ai-model-credit-prices/ai-model-credit-prices.routes.js';
import { modelWorkflowsRoutes } from './model-workflows/model-workflows.routes.js';
import { aiModelsRoutes } from './ai-models/ai-models.routes.js';
import { aiProvidersRoutes } from './ai-providers/ai-providers.routes.js';
import { authRoutes } from './auth/auth.routes.js';
import {
  adminUserWalletRoutes,
  myWalletRoutes,
} from './credit-wallets/credit-wallets.routes.js';
import { generationTypesRoutes } from './generation-types/generation-types.routes.js';
import { healthRoutes } from './health/health.routes.js';
import { platformSettingsRoutes } from './platform-settings/platform-settings.routes.js';

export async function registerRoutes(fastify) {
  await fastify.register(healthRoutes, { prefix: '/health' });
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(myWalletRoutes, { prefix: '/api/wallet' });
  await fastify.register(aiProvidersRoutes, { prefix: '/api/admin/providers' });
  await fastify.register(aiModelsRoutes, { prefix: '/api/admin/models' });
  await fastify.register(modelWorkflowsRoutes, {
    prefix: '/api/admin/models',
  });
  await fastify.register(aiModelCreditPricesRoutes, {
    prefix: '/api/admin/models',
  });
  await fastify.register(generationTypesRoutes, {
    prefix: '/api/admin/generation-types',
  });
  await fastify.register(platformSettingsRoutes, {
    prefix: '/api/admin/settings',
  });
  await fastify.register(adminUserWalletRoutes, { prefix: '/api/admin/users' });
}
