import { sql } from 'drizzle-orm';
import {
  check,
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
import { images } from '#src/modules/images/image.table.js';
import {
  generationStatusEnum,
  providerErrorCategoryEnum,
} from '#src/modules/generations/generation.table.js';
import { IMAGE_ANALYSIS_TASKS } from '#src/modules/image-analyses/image-analysis.constants.js';

export const imageAnalysisTaskEnum = pgEnum(
  'image_analysis_task',
  IMAGE_ANALYSIS_TASKS,
);

export const imageAnalyses = pgTable(
  'image_analyses',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    imageId: uuid()
      .notNull()
      .references(() => images.id, { onDelete: 'cascade' }),
    task: imageAnalysisTaskEnum().notNull(),
    question: text(),
    result: jsonb(),
    status: generationStatusEnum().notNull(),
    credits: integer().notNull(),
    model: varchar({ length: 100 }).notNull(),
    errorCategory: providerErrorCategoryEnum(),
    completedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('image_analyses_image_id_created_at_idx').on(
      table.imageId,
      table.createdAt,
    ),
    index('image_analyses_status_created_at_idx').on(
      table.status,
      table.createdAt,
    ),
    check('image_analyses_credits_not_negative', sql`${table.credits} >= 0`),
  ],
);
