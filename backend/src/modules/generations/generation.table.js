import { sql } from 'drizzle-orm';
import {
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { PROVIDER_ERROR_CATEGORIES } from '#src/constants/index.js';
import { users } from '#src/modules/users/user.table.js';
import { aiModels } from '#src/modules/ai-models/ai-model.table.js';
import { modelWorkflows } from '#src/modules/model-workflows/model-workflow.table.js';
import { images } from '#src/modules/images/image.table.js';
import { GENERATION_STATUSES } from '#src/modules/generations/generation.constants.js';

export const generationStatusEnum = pgEnum(
  'generation_status',
  GENERATION_STATUSES,
);

export const providerErrorCategoryEnum = pgEnum(
  'provider_error_category',
  PROVIDER_ERROR_CATEGORIES,
);

export const generations = pgTable(
  'generations',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    modelId: uuid().notNull(),
    modelWorkflowId: uuid().notNull(),
    sourceImageId: uuid().references(() => images.id, {
      onDelete: 'set null',
    }),
    prompt: text().notNull(),
    options: jsonb().notNull(),
    status: generationStatusEnum().notNull(),
    creditsPerImage: integer().notNull(),
    totalCredits: integer().notNull(),
    errorCategory: providerErrorCategoryEnum(),
    completedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    foreignKey({
      name: 'generations_model_fk',
      columns: [table.modelId],
      foreignColumns: [aiModels.id],
    }).onDelete('restrict'),
    foreignKey({
      name: 'generations_model_workflow_fk',
      columns: [table.modelWorkflowId],
      foreignColumns: [modelWorkflows.id],
    }).onDelete('restrict'),
    index('generations_source_image_id_idx').on(table.sourceImageId),
    index('generations_user_id_created_at_idx').on(
      table.userId,
      table.createdAt,
    ),
    check(
      'generations_credits_positive',
      sql`${table.creditsPerImage} > 0 AND ${table.totalCredits} > 0`,
    ),
  ],
);
