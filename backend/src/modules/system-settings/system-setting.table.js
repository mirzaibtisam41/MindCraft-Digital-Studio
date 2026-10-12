import { jsonb, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { SYSTEM_SETTING_KEY_MAX_LENGTH } from './system-setting.constants.js';

export const systemSettings = pgTable('system_settings', {
  key: varchar('key', { length: SYSTEM_SETTING_KEY_MAX_LENGTH }).primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
