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

export const aiModelGenerationTypes = pgTable(
  'ai_model_generation_types',
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
      name: 'ai_model_generation_types_model_fk',
      columns: [table.modelId],
      foreignColumns: [aiModels.id],
    }).onDelete('cascade'),
    foreignKey({
      name: 'ai_model_generation_types_generation_type_fk',
      columns: [table.generationTypeId],
      foreignColumns: [generationTypes.id],
    }).onDelete('restrict'),
    unique('ai_model_generation_types_model_type_unique').on(
      table.modelId,
      table.generationTypeId,
    ),
  ],
);
