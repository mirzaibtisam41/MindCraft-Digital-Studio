import { listUserNotificationsRepository } from '#src/modules/notifications/shared/repositories/index.js';

export async function listMyNotificationsController(request, reply) {
  const { notifications, unreadCount } = await listUserNotificationsRepository({
    db: request.server.db,
    userId: request.user.id,
    limit: 30,
  });

  return reply.success({ data: { notifications }, meta: { unreadCount } });
}
