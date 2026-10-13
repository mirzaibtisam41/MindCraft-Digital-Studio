import { jsonb, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from '#src/modules/users/user.table.js';
import { PLATFORM_SETTING_KEY_MAX_LENGTH } from './platform-setting.constants.js';

export const platformSettings = pgTable('platform_settings', {
  key: varchar({ length: PLATFORM_SETTING_KEY_MAX_LENGTH }).primaryKey(),
  value: jsonb().notNull(),
  updatedBy: uuid().references(() => users.id, { onDelete: 'set null' }),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
