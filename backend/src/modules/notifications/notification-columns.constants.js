import { notifications } from '#src/modules/notifications/notification.table.js';

export const NOTIFICATION_COLUMNS = {
  id: notifications.id,
  type: notifications.type,
  title: notifications.title,
  body: notifications.body,
  link: notifications.link,
  readAt: notifications.readAt,
  createdAt: notifications.createdAt,
};
