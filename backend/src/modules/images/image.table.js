import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from '#src/modules/users/user.table.js';
import { generations } from '#src/modules/generations/generation.table.js';
import {
  IMAGE_ORIGINAL_FILE_NAME_MAX_LENGTH,
  IMAGE_SOURCES,
} from '#src/modules/images/image.constants.js';

export const imageSourceEnum = pgEnum('image_source', IMAGE_SOURCES);

export const images = pgTable(
  'images',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    source: imageSourceEnum().notNull(),
    generationId: uuid().references(() => generations.id, {
      onDelete: 'set null',
    }),
    storageKey: varchar({ length: 512 })
      .notNull()
      .unique('images_storage_key_unique'),
    contentType: varchar({ length: 50 }).notNull(),
    width: integer().notNull(),
    height: integer().notNull(),
    sizeBytes: integer().notNull(),
    originalFileName: varchar({ length: IMAGE_ORIGINAL_FILE_NAME_MAX_LENGTH }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('images_user_id_created_at_idx').on(table.userId, table.createdAt),
    index('images_generation_id_idx').on(table.generationId),
    check(
      'images_dimensions_positive',
      sql`${table.width} > 0 AND ${table.height} > 0`,
    ),
    check('images_size_bytes_positive', sql`${table.sizeBytes} > 0`),
  ],
);
