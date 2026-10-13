import { sql } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import {
  IMAGE_MODEL_BADGE_MAX_LENGTH,
  IMAGE_MODEL_DEFAULT_TOOLS,
  IMAGE_MODEL_DESCRIPTION_MAX_LENGTH,
  IMAGE_MODEL_ID_MAX_LENGTH,
  IMAGE_MODEL_LABEL_MAX_LENGTH,
  IMAGE_MODEL_PROVIDER_MAX_LENGTH,
} from './image-model.constants.js';

export const imageModels = pgTable(
  'image_models',
  {
    id: varchar('id', { length: IMAGE_MODEL_ID_MAX_LENGTH }).primaryKey(),
    provider: varchar('provider', {
      length: IMAGE_MODEL_PROVIDER_MAX_LENGTH,
    }).notNull(),
    label: varchar('label', { length: IMAGE_MODEL_LABEL_MAX_LENGTH }).notNull(),
    description: varchar('description', {
      length: IMAGE_MODEL_DESCRIPTION_MAX_LENGTH,
    })
      .notNull()
      .default(''),
    badge: varchar('badge', { length: IMAGE_MODEL_BADGE_MAX_LENGTH }),
    enabled: boolean('enabled').notNull().default(true),
    isDefault: boolean('is_default').notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
    tools: jsonb('tools').notNull().default(IMAGE_MODEL_DEFAULT_TOOLS),
    capabilities: jsonb('capabilities').notNull(),
    creditsPerImage: jsonb('credits_per_image').notNull(),
    providerCostPerImage: jsonb('provider_cost_per_image')
      .notNull()
      .default({}),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex('image_models_single_default_idx')
      .on(table.isDefault)
      .where(sql`${table.isDefault}`),
  ],
);
