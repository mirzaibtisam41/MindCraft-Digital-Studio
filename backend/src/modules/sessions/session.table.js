import { index, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from '#src/modules/users/user.table.js';
import {
  SESSION_IP_ADDRESS_MAX_LENGTH,
  SESSION_REFRESH_TOKEN_HASH_LENGTH,
  SESSION_USER_AGENT_MAX_LENGTH,
} from './session.constants.js';

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    refreshTokenHash: varchar('refresh_token_hash', {
      length: SESSION_REFRESH_TOKEN_HASH_LENGTH,
    })
      .notNull()
      .unique(),
    userAgent: varchar('user_agent', { length: SESSION_USER_AGENT_MAX_LENGTH }),
    ipAddress: varchar('ip_address', { length: SESSION_IP_ADDRESS_MAX_LENGTH }),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('sessions_user_id_idx').on(table.userId)],
);
