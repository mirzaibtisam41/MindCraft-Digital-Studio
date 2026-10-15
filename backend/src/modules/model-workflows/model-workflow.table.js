import {
  boolean,
  foreignKey,
  jsonb,
  pgTable,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import { aiModels } from '#src/modules/ai-models/ai-model.table.js';
import { generationTypes } from '#src/modules/generation-types/generation-type.table.js';

export const modelWorkflows = pgTable(
  'model_workflows',
  {
    id: uuid().primaryKey().defaultRandom(),
    modelId: uuid().notNull(),
    generationTypeId: uuid().notNull(),
    isEnabled: boolean().notNull().default(false),
    enabledOptions: jsonb(),
    defaultOptions: jsonb(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    foreignKey({
      name: 'model_workflows_model_fk',
      columns: [table.modelId],
      foreignColumns: [aiModels.id],
    }).onDelete('cascade'),
    foreignKey({
      name: 'model_workflows_generation_type_fk',
      columns: [table.generationTypeId],
      foreignColumns: [generationTypes.id],
    }).onDelete('restrict'),
    unique('model_workflows_model_type_unique').on(
      table.modelId,
      table.generationTypeId,
    ),
  ],
);
