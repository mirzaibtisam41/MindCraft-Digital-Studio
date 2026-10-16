import { checkUserIsLoggedInHook } from '#src/hooks/index.js';
import { uuidParamsSchema } from '#src/shared/schemas/uuid-params.schema.js';
import { listMyNotificationsController } from '#src/modules/notifications/features/list-my-notifications/list-my-notifications.controller.js';
import { markAllNotificationsReadController } from '#src/modules/notifications/features/mark-all-notifications-read/mark-all-notifications-read.controller.js';
import { markNotificationReadController } from '#src/modules/notifications/features/mark-notification-read/mark-notification-read.controller.js';

export function notificationsRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);

  fastify.get('/', listMyNotificationsController);

  fastify.post('/read-all', markAllNotificationsReadController);

  fastify.post(
    '/:id/read',
    { schema: { params: uuidParamsSchema('id') } },
    markNotificationReadController,
  );
}
