import { aiModelCreditPricesRoutes } from '#src/modules/ai-model-credit-prices/ai-model-credit-prices.routes.js';
import { modelWorkflowsRoutes } from '#src/modules/model-workflows/model-workflows.routes.js';
import { aiModelsRoutes } from '#src/modules/ai-models/ai-models.routes.js';
import { aiProvidersRoutes } from '#src/modules/ai-providers/ai-providers.routes.js';
import { authRoutes } from '#src/modules/auth/auth.routes.js';
import {
  adminUserWalletRoutes,
  myWalletRoutes,
} from '#src/modules/credit-wallets/credit-wallets.routes.js';
import { generationTypesRoutes } from '#src/modules/generation-types/generation-types.routes.js';
import { generationsRoutes } from '#src/modules/generations/generations.routes.js';
import { healthRoutes } from '#src/modules/health/health.routes.js';
import { imagesRoutes } from '#src/modules/images/images.routes.js';
import { platformSettingsRoutes } from '#src/modules/platform-settings/platform-settings.routes.js';
import { adminUsersRoutes } from '#src/modules/users/users.routes.js';

export async function registerRoutes(fastify) {
  await fastify.register(healthRoutes, { prefix: '/health' });
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(myWalletRoutes, { prefix: '/api/wallet' });
  await fastify.register(imagesRoutes, { prefix: '/api/images' });
  await fastify.register(generationsRoutes, { prefix: '/api/generations' });
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
  await fastify.register(adminUsersRoutes, { prefix: '/api/admin/users' });
  await fastify.register(adminUserWalletRoutes, { prefix: '/api/admin/users' });
}
