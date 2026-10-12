import { auditLogs } from '#src/modules/audit-logs/audit-log.table.js';

export async function insertAuditLogRepository({ db, data }) {
  const [auditLog] = await db.insert(auditLogs).values(data).returning();

  return auditLog;
}
