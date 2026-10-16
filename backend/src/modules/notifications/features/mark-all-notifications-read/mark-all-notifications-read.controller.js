import { markUserNotificationsReadRepository } from '#src/modules/notifications/shared/repositories/index.js';

export async function markAllNotificationsReadController(request, reply) {
  const markedCount = await markUserNotificationsReadRepository({
    db: request.server.db,
    userId: request.user.id,
  });

  return reply.success({
    data: { markedCount },
    message: 'All notifications marked as read',
  });
}
