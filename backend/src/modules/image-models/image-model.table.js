import {
  boolean,
  integer,
  jsonb,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import {
  IMAGE_MODEL_ID_MAX_LENGTH,
  IMAGE_MODEL_LABEL_MAX_LENGTH,
  IMAGE_MODEL_PROVIDER_MAX_LENGTH,
} from './image-model.constants.js';

export const imageModels = pgTable('image_models', {
  id: varchar('id', { length: IMAGE_MODEL_ID_MAX_LENGTH }).primaryKey(),
  provider: varchar('provider', {
    length: IMAGE_MODEL_PROVIDER_MAX_LENGTH,
  }).notNull(),
  label: varchar('label', { length: IMAGE_MODEL_LABEL_MAX_LENGTH }).notNull(),
  enabled: boolean('enabled').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  capabilities: jsonb('capabilities').notNull(),
  creditsPerImage: jsonb('credits_per_image').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
