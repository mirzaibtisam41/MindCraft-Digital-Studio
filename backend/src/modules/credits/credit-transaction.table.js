import {
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from '#src/modules/users/user.table.js';
import { generations } from '#src/modules/generations/generation.table.js';
import {
  CREDIT_IDEMPOTENCY_KEY_MAX_LENGTH,
  CREDIT_TRANSACTION_TYPES,
} from './credit.constants.js';

export const creditTransactionTypeEnum = pgEnum(
  'credit_transaction_type',
  CREDIT_TRANSACTION_TYPES,
);

export const creditTransactions = pgTable(
  'credit_transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    amount: integer('amount').notNull(),
    type: creditTransactionTypeEnum('type').notNull(),
    generationId: uuid('generation_id').references(() => generations.id, {
      onDelete: 'set null',
    }),
    idempotencyKey: varchar('idempotency_key', {
      length: CREDIT_IDEMPOTENCY_KEY_MAX_LENGTH,
    })
      .notNull()
      .unique(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('credit_transactions_user_id_created_at_idx').on(
      table.userId,
      table.createdAt,
    ),
    index('credit_transactions_generation_id_idx').on(table.generationId),
  ],
);
