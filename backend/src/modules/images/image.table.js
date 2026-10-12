import {
  index,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from '#src/modules/users/user.table.js';
import { generations } from '#src/modules/generations/generation.table.js';
import {
  IMAGE_CONTENT_TYPE_MAX_LENGTH,
  IMAGE_STORAGE_KEY_MAX_LENGTH,
} from './image.constants.js';

export const images = pgTable(
  'images',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    generationId: uuid('generation_id').references(() => generations.id, {
      onDelete: 'set null',
    }),
    storageKey: varchar('storage_key', {
      length: IMAGE_STORAGE_KEY_MAX_LENGTH,
    })
      .notNull()
      .unique(),
    contentType: varchar('content_type', {
      length: IMAGE_CONTENT_TYPE_MAX_LENGTH,
    }).notNull(),
    width: integer('width').notNull(),
    height: integer('height').notNull(),
    sizeBytes: integer('size_bytes').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('images_user_id_created_at_idx').on(table.userId, table.createdAt),
    index('images_generation_id_idx').on(table.generationId),
  ],
);
