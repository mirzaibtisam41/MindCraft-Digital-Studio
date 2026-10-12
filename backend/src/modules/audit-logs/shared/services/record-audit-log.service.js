import * as auditLogRepositories from '#src/modules/audit-logs/shared/repositories/index.js';

export async function recordAuditLogService({
  db,
  actorId,
  action,
  targetType,
  targetId,
  changes = {},
}) {
  return auditLogRepositories.insertAuditLogRepository({
    db,
    data: { actorId, action, targetType, targetId: String(targetId), changes },
  });
}
