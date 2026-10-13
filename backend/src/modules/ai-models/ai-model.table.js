import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { aiProviders } from '#src/modules/ai-providers/ai-provider.table.js';
import { users } from '#src/modules/users/user.table.js';
import {
  AI_MODEL_NAME_MAX_LENGTH,
  AI_MODEL_PROVIDER_MODEL_ID_MAX_LENGTH,
  AI_MODEL_SLUG_MAX_LENGTH,
  AI_MODEL_STATUS,
  AI_MODEL_STATUSES,
} from './ai-model.constants.js';

export const aiModelStatusEnum = pgEnum('ai_model_status', AI_MODEL_STATUSES);

export const aiModels = pgTable(
  'ai_models',
  {
    id: uuid().primaryKey().defaultRandom(),
    providerId: uuid()
      .notNull()
      .references(() => aiProviders.id, { onDelete: 'restrict' }),
    name: varchar({ length: AI_MODEL_NAME_MAX_LENGTH }).notNull(),
    slug: varchar({ length: AI_MODEL_SLUG_MAX_LENGTH })
      .notNull()
      .unique('ai_models_slug_unique'),
    providerModelId: varchar({
      length: AI_MODEL_PROVIDER_MODEL_ID_MAX_LENGTH,
    }).notNull(),
    description: text(),
    status: aiModelStatusEnum().notNull().default(AI_MODEL_STATUS.DRAFT),
    sortOrder: integer().notNull().default(0),
    createdBy: uuid().references(() => users.id, { onDelete: 'set null' }),
    updatedBy: uuid().references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique('ai_models_provider_model_unique').on(
      table.providerId,
      table.providerModelId,
    ),
  ],
);
