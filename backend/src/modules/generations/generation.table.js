import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from '#src/modules/users/user.table.js';
import {
  GENERATION_ERROR_CATEGORY_MAX_LENGTH,
  GENERATION_ERROR_MESSAGE_MAX_LENGTH,
  GENERATION_MODEL_MAX_LENGTH,
  GENERATION_PROVIDER_MAX_LENGTH,
  GENERATION_STATUS,
  GENERATION_STATUSES,
  GENERATION_TYPES,
} from './generation.constants.js';

export const generationTypeEnum = pgEnum('generation_type', GENERATION_TYPES);

export const generationStatusEnum = pgEnum(
  'generation_status',
  GENERATION_STATUSES,
);

export const generations = pgTable(
  'generations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: generationTypeEnum('type').notNull(),
    status: generationStatusEnum('status')
      .notNull()
      .default(GENERATION_STATUS.PENDING),
    prompt: text('prompt').notNull(),
    enhancedPrompt: text('enhanced_prompt'),
    negativePrompt: text('negative_prompt'),
    provider: varchar('provider', {
      length: GENERATION_PROVIDER_MAX_LENGTH,
    }).notNull(),
    model: varchar('model', { length: GENERATION_MODEL_MAX_LENGTH }).notNull(),
    settings: jsonb('settings').notNull().default({}),
    imageCount: integer('image_count').notNull().default(1),
    errorCategory: varchar('error_category', {
      length: GENERATION_ERROR_CATEGORY_MAX_LENGTH,
    }),
    errorMessage: varchar('error_message', {
      length: GENERATION_ERROR_MESSAGE_MAX_LENGTH,
    }),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('generations_user_id_created_at_idx').on(
      table.userId,
      table.createdAt,
    ),
    index('generations_status_idx').on(table.status),
  ],
);
