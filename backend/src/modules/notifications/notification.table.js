import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from '#src/modules/users/user.table.js';
import {
  NOTIFICATION_TITLE_MAX_LENGTH,
  NOTIFICATION_TYPES,
} from '#src/modules/notifications/notification.constants.js';

export const notificationTypeEnum = pgEnum(
  'notification_type',
  NOTIFICATION_TYPES,
);

export const notifications = pgTable(
  'notifications',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: notificationTypeEnum().notNull(),
    title: varchar({ length: NOTIFICATION_TITLE_MAX_LENGTH }).notNull(),
    body: text(),
    link: varchar({ length: 300 }),
    readAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('notifications_user_id_created_at_idx').on(
      table.userId,
      table.createdAt,
    ),
  ],
);
