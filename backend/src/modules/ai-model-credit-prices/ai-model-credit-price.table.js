import { sql } from 'drizzle-orm';
import {
  check,
  foreignKey,
  integer,
  pgTable,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { modelWorkflows } from '#src/modules/model-workflows/model-workflow.table.js';
import { users } from '#src/modules/users/user.table.js';
import { AI_MODEL_CREDIT_PRICE_QUALITY_MAX_LENGTH } from './ai-model-credit-price.constants.js';

export const aiModelCreditPrices = pgTable(
  'ai_model_credit_prices',
  {
    id: uuid().primaryKey().defaultRandom(),
    modelWorkflowId: uuid().notNull(),
    quality: varchar({
      length: AI_MODEL_CREDIT_PRICE_QUALITY_MAX_LENGTH,
    }).notNull(),
    creditsPerImage: integer().notNull(),
    updatedBy: uuid().references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    foreignKey({
      name: 'ai_model_credit_prices_workflow_fk',
      columns: [table.modelWorkflowId],
      foreignColumns: [modelWorkflows.id],
    }).onDelete('cascade'),
    unique('ai_model_credit_prices_workflow_quality_unique').on(
      table.modelWorkflowId,
      table.quality,
    ),
    check(
      'ai_model_credit_prices_credits_positive',
      sql`${table.creditsPerImage} > 0`,
    ),
  ],
);
