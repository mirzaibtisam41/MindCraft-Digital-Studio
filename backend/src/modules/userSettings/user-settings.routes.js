import { checkUserIsLoggedInHook } from '#src/hooks/index.js';
import { getMySettingsController } from './features/getMySettings/get-my-settings.controller.js';
import { updateMySettingsController } from './features/updateMySettings/update-my-settings.controller.js';
import { updateMySettingsBodySchema } from './features/updateMySettings/update-my-settings.schema.js';

export function userSettingsRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);

  fastify.get('/', getMySettingsController);

  fastify.patch(
    '/',
    { schema: { body: updateMySettingsBodySchema } },
    updateMySettingsController,
  );
}
