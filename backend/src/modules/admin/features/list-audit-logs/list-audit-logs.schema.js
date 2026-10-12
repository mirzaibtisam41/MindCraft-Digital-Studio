import { AUDIT_ACTIONS } from '#src/modules/audit-logs/audit-log.constants.js';
import { paginationQueryProperties } from '#src/modules/admin/shared/schemas/pagination-query.schema.js';

export const listAuditLogsQuerySchema = {
  type: 'object',
  properties: {
    ...paginationQueryProperties,
    action: { type: 'string', enum: AUDIT_ACTIONS },
  },
  additionalProperties: false,
};
