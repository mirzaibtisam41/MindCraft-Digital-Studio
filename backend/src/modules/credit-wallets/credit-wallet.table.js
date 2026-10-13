import { sql } from 'drizzle-orm';
import { check, integer, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from '#src/modules/users/user.table.js';

export const creditWallets = pgTable(
  'credit_wallets',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .unique('credit_wallets_user_unique')
      .references(() => users.id, { onDelete: 'cascade' }),
    balance: integer().notNull().default(0),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    check('credit_wallets_balance_not_negative', sql`${table.balance} >= 0`),
  ],
);
