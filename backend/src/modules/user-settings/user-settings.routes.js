import { checkUserIsLoggedInHook } from '#src/hooks/index.js';
import { getMySettingsController } from './features/get-my-settings/get-my-settings.controller.js';
import { updateMySettingsController } from './features/update-my-settings/update-my-settings.controller.js';
import { updateMySettingsBodySchema } from './features/update-my-settings/update-my-settings.schema.js';

export function userSettingsRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);

  fastify.get('/', getMySettingsController);

  fastify.patch(
    '/',
    { schema: { body: updateMySettingsBodySchema } },
    updateMySettingsController,
  );
}
