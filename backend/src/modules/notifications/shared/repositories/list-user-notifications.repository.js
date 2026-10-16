import { and, count, desc, eq, isNull } from 'drizzle-orm';
import { notifications } from '#src/modules/notifications/notification.table.js';
import { NOTIFICATION_COLUMNS } from '#src/modules/notifications/notification-columns.constants.js';

export async function listUserNotificationsRepository({ db, userId, limit }) {
  const notificationList = await db
    .select(NOTIFICATION_COLUMNS)
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt), desc(notifications.id))
    .limit(limit);

  const [{ unreadCount }] = await db
    .select({ unreadCount: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));

  return { notifications: notificationList, unreadCount };
}
