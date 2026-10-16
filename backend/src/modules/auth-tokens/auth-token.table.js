import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from '#src/modules/users/user.table.js';
import { USER_EMAIL_MAX_LENGTH } from '#src/modules/users/user.constants.js';
import { AUTH_TOKEN_TYPES } from '#src/modules/auth-tokens/auth-token.constants.js';

export const authTokenTypeEnum = pgEnum('auth_token_type', AUTH_TOKEN_TYPES);

export const authTokens = pgTable(
  'auth_tokens',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: authTokenTypeEnum().notNull(),
    tokenHash: text().notNull().unique('auth_tokens_token_hash_unique'),
    newEmail: varchar({ length: USER_EMAIL_MAX_LENGTH }),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    usedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('auth_tokens_user_id_idx').on(table.userId)],
);
