import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import {
  GENERATION_TYPE_CODE_MAX_LENGTH,
  GENERATION_TYPE_NAME_MAX_LENGTH,
} from '#src/modules/generation-types/generation-type.constants.js';

export const generationTypes = pgTable('generation_types', {
  id: uuid().primaryKey().defaultRandom(),
  code: varchar({ length: GENERATION_TYPE_CODE_MAX_LENGTH })
    .notNull()
    .unique('generation_types_code_unique'),
  name: varchar({ length: GENERATION_TYPE_NAME_MAX_LENGTH }).notNull(),
  description: text(),
  isActive: boolean().notNull().default(true),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
