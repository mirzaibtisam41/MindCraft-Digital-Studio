import {
  boolean,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import {
  AI_PROVIDER_CODE_MAX_LENGTH,
  AI_PROVIDER_NAME_MAX_LENGTH,
} from './ai-provider.constants.js';

export const aiProviders = pgTable('ai_providers', {
  id: uuid().primaryKey().defaultRandom(),
  code: varchar({ length: AI_PROVIDER_CODE_MAX_LENGTH })
    .notNull()
    .unique('ai_providers_code_unique'),
  name: varchar({ length: AI_PROVIDER_NAME_MAX_LENGTH }).notNull(),
  isActive: boolean().notNull().default(false),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
