import {
  index,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from '#src/modules/users/user.table.js';
import {
  AUDIT_ACTION_MAX_LENGTH,
  AUDIT_TARGET_ID_MAX_LENGTH,
  AUDIT_TARGET_TYPE_MAX_LENGTH,
} from './audit-log.constants.js';

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    actorId: uuid('actor_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    action: varchar('action', { length: AUDIT_ACTION_MAX_LENGTH }).notNull(),
    targetType: varchar('target_type', {
      length: AUDIT_TARGET_TYPE_MAX_LENGTH,
    }).notNull(),
    targetId: varchar('target_id', {
      length: AUDIT_TARGET_ID_MAX_LENGTH,
    }).notNull(),
    changes: jsonb('changes').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('audit_logs_created_at_idx').on(table.createdAt),
    index('audit_logs_action_idx').on(table.action),
  ],
);
