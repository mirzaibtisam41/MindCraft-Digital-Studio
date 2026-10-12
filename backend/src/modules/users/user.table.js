import { sql } from 'drizzle-orm';
import {
  check,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import {
  USER_EMAIL_MAX_LENGTH,
  USER_NAME_MAX_LENGTH,
  USER_PASSWORD_HASH_MAX_LENGTH,
  USER_ROLE,
  USER_ROLES,
} from './user.constants.js';

export const userRoleEnum = pgEnum('user_role', USER_ROLES);

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: USER_NAME_MAX_LENGTH }).notNull(),
    email: varchar('email', { length: USER_EMAIL_MAX_LENGTH })
      .notNull()
      .unique(),
    passwordHash: varchar('password_hash', {
      length: USER_PASSWORD_HASH_MAX_LENGTH,
    }).notNull(),
    role: userRoleEnum('role').notNull().default(USER_ROLE.USER),
    suspendedAt: timestamp('suspended_at', { withTimezone: true }),
    creditBalance: integer('credit_balance').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    check(
      'users_credit_balance_non_negative',
      sql`${table.creditBalance} >= 0`,
    ),
  ],
);
