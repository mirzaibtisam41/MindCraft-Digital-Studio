import { and, eq, isNull } from 'drizzle-orm';
import { notifications } from '#src/modules/notifications/notification.table.js';

export async function markUserNotificationsReadRepository({ db, userId, id }) {
  const marked = await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.userId, userId),
        isNull(notifications.readAt),
        id ? eq(notifications.id, id) : undefined,
      ),
    )
    .returning({ id: notifications.id });

  return marked.length;
}
