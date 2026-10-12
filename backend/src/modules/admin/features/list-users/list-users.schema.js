import {
  ADMIN_SEARCH_MAX_LENGTH,
  USER_STATUSES,
} from '#src/modules/admin/admin.constants.js';
import { paginationQueryProperties } from '#src/modules/admin/shared/schemas/pagination-query.schema.js';
import { USER_ROLES } from '#src/modules/users/user.constants.js';

export const listUsersQuerySchema = {
  type: 'object',
  properties: {
    ...paginationQueryProperties,
    search: { type: 'string', maxLength: ADMIN_SEARCH_MAX_LENGTH },
    role: { type: 'string', enum: USER_ROLES },
    status: { type: 'string', enum: USER_STATUSES },
  },
  additionalProperties: false,
};
