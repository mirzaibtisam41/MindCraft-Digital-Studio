import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from '#src/modules/users/user.table.js';
import { PROMPT_TITLE_MAX_LENGTH } from '#src/modules/prompts/prompt.constants.js';

export const prompts = pgTable(
  'prompts',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: varchar({ length: PROMPT_TITLE_MAX_LENGTH }).notNull(),
    text: text().notNull(),
    category: varchar({ length: 30 }).notNull(),
    style: varchar({ length: 40 }),
    usageCount: integer().notNull().default(0),
    lastUsedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('prompts_user_id_updated_at_idx').on(table.userId, table.updatedAt),
  ],
);
