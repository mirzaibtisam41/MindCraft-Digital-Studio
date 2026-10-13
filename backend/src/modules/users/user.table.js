import { sql } from 'drizzle-orm';
import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import {
  USER_EMAIL_MAX_LENGTH,
  USER_NAME_MAX_LENGTH,
  USER_ROLE,
  USER_ROLES,
  USER_STATUS,
  USER_STATUSES,
} from './user.constants.js';

export const userRoleEnum = pgEnum('user_role', USER_ROLES);

export const userStatusEnum = pgEnum('user_status', USER_STATUSES);

export const users = pgTable(
  'users',
  {
    id: uuid().primaryKey().defaultRandom(),
    name: varchar({ length: USER_NAME_MAX_LENGTH }).notNull(),
    email: varchar({ length: USER_EMAIL_MAX_LENGTH }).notNull(),
    passwordHash: text().notNull(),
    role: userRoleEnum().notNull().default(USER_ROLE.USER),
    status: userStatusEnum().notNull().default(USER_STATUS.ACTIVE),
    emailVerifiedAt: timestamp({ withTimezone: true }),
    lastLoginAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex('users_email_lower_unique').on(sql`lower(${table.email})`),
  ],
);
