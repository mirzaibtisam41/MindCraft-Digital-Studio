import { NotFoundError } from '#src/utils/index.js';
import {
  findUserNotificationRepository,
  markUserNotificationsReadRepository,
} from '#src/modules/notifications/shared/repositories/index.js';

export async function markNotificationReadController(request, reply) {
  const { db } = request.server;
  const userId = request.user.id;
  const { id } = request.params;

  await markUserNotificationsReadRepository({ db, userId, id });

  const notification = await findUserNotificationRepository({
    db,
    userId,
    id,
  });

  if (!notification) {
    throw new NotFoundError('Notification not found');
  }

  return reply.success({ data: { notification } });
}
