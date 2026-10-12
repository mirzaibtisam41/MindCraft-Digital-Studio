import { desc, eq, sql } from 'drizzle-orm';
import { auditLogs } from '#src/modules/audit-logs/audit-log.table.js';
import { users } from '#src/modules/users/user.table.js';

export async function listAuditLogsRepository({ db, action, limit, offset }) {
  const where = action ? eq(auditLogs.action, action) : undefined;

  const items = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      targetType: auditLogs.targetType,
      targetId: auditLogs.targetId,
      changes: auditLogs.changes,
      createdAt: auditLogs.createdAt,
      actorId: auditLogs.actorId,
      actorName: users.name,
      actorEmail: users.email,
    })
    .from(auditLogs)
    .leftJoin(users, eq(users.id, auditLogs.actorId))
    .where(where)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: sql`count(*)::int` })
    .from(auditLogs)
    .where(where);

  return { items, total };
}
