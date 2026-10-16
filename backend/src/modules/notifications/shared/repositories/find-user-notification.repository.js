import { and, eq } from 'drizzle-orm';
import { notifications } from '#src/modules/notifications/notification.table.js';
import { NOTIFICATION_COLUMNS } from '#src/modules/notifications/notification-columns.constants.js';

export async function findUserNotificationRepository({ db, userId, id }) {
  const [notification] = await db
    .select(NOTIFICATION_COLUMNS)
    .from(notifications)
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
    .limit(1);

  return notification ?? null;
}
