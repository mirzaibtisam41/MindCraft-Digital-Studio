import * as auditLogRepositories from '#src/modules/audit-logs/shared/repositories/index.js';
import {
  buildPageMetaUtil,
  buildPaginationUtil,
} from '#src/modules/admin/shared/utils/index.js';

export async function listAuditLogsController(request, reply) {
  const { page, pageSize, action } = request.query;
  const { items, total } = await auditLogRepositories.listAuditLogsRepository({
    db: request.server.db,
    action,
    ...buildPaginationUtil({ page, pageSize }),
  });

  return reply.success({
    data: items,
    meta: buildPageMetaUtil({ page, pageSize, total }),
  });
}
