import { notifications } from '#src/modules/notifications/notification.table.js';
import { NOTIFICATION_COLUMNS } from '#src/modules/notifications/notification-columns.constants.js';

export async function createNotificationRepository({ db, data }) {
  const [notification] = await db
    .insert(notifications)
    .values(data)
    .returning(NOTIFICATION_COLUMNS);

  return notification;
}
