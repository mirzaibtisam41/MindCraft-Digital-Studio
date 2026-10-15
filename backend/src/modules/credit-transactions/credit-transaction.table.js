import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { creditWallets } from '#src/modules/credit-wallets/credit-wallet.table.js';
import { users } from '#src/modules/users/user.table.js';
import { CREDIT_TRANSACTION_TYPES } from '#src/modules/credit-transactions/credit-transaction.constants.js';

export const creditTransactionTypeEnum = pgEnum(
  'credit_transaction_type',
  CREDIT_TRANSACTION_TYPES,
);

export const creditTransactions = pgTable(
  'credit_transactions',
  {
    id: uuid().primaryKey().defaultRandom(),
    walletId: uuid()
      .notNull()
      .references(() => creditWallets.id, { onDelete: 'cascade' }),
    amount: integer().notNull(),
    balanceAfter: integer().notNull(),
    type: creditTransactionTypeEnum().notNull(),
    idempotencyKey: varchar({
      length: 200,
    }).unique('credit_transactions_idempotency_key_unique'),
    reason: text(),
    createdBy: uuid().references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('credit_transactions_wallet_id_idx').on(
      table.walletId,
      table.createdAt,
    ),
    check('credit_transactions_amount_not_zero', sql`${table.amount} <> 0`),
    check(
      'credit_transactions_balance_after_not_negative',
      sql`${table.balanceAfter} >= 0`,
    ),
  ],
);
