import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from '#src/modules/users/user.table.js';

const IP_ADDRESS_MAX_LENGTH = 45;

export const authSessions = pgTable(
  'auth_sessions',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    familyId: uuid().notNull(),
    refreshTokenHash: text()
      .notNull()
      .unique('auth_sessions_refresh_token_hash_unique'),
    replacedById: uuid().references(() => authSessions.id, {
      onDelete: 'set null',
    }),
    userAgent: text(),
    ipAddress: varchar({ length: IP_ADDRESS_MAX_LENGTH }),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    lastUsedAt: timestamp({ withTimezone: true }),
    revokedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('auth_sessions_user_id_idx').on(table.userId),
    index('auth_sessions_family_id_idx').on(table.familyId),
  ],
);
