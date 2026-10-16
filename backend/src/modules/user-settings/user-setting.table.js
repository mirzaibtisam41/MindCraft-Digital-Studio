import {
  boolean,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from '#src/modules/users/user.table.js';
import { aiModels } from '#src/modules/ai-models/ai-model.table.js';

export const userSettings = pgTable('user_settings', {
  userId: uuid()
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  defaultModelId: uuid().references(() => aiModels.id, {
    onDelete: 'set null',
  }),
  defaultSize: varchar({ length: 20 }),
  defaultQuality: varchar({ length: 20 }),
  defaultImageCount: integer(),
  notifyGenerationFailed: boolean().notNull().default(true),
  notifyCreditChanges: boolean().notNull().default(true),
  notifyLowCredits: boolean().notNull().default(true),
  lowCreditThreshold: integer().notNull().default(20),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
