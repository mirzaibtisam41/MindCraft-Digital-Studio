import {
  checkUserIsAdminHook,
  checkUserIsLoggedInHook,
} from '#src/hooks/index.js';
import { getPlatformSettingsController } from '#src/modules/platform-settings/features/get-platform-settings/get-platform-settings.controller.js';
import { updatePlatformSettingsController } from '#src/modules/platform-settings/features/update-platform-settings/update-platform-settings.controller.js';
import { updatePlatformSettingsBodySchema } from '#src/modules/platform-settings/features/update-platform-settings/update-platform-settings.schema.js';

export function platformSettingsRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);
  fastify.addHook('onRequest', checkUserIsAdminHook);

  fastify.get('/', getPlatformSettingsController);

  fastify.patch(
    '/',
    { schema: { body: updatePlatformSettingsBodySchema } },
    updatePlatformSettingsController,
  );
}
