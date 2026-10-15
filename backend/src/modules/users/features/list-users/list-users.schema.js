import {
  USER_EMAIL_MAX_LENGTH,
  USER_ROLES,
  USER_STATUSES,
} from '#src/modules/users/user.constants.js';
import { paginationQuerySchema } from '#src/shared/schemas/pagination-query.schema.js';

export const listUsersQuerySchema = {
  type: 'object',
  properties: {
    ...paginationQuerySchema.properties,
    search: { type: 'string', maxLength: USER_EMAIL_MAX_LENGTH },
    role: { type: 'string', enum: USER_ROLES },
    status: { type: 'string', enum: USER_STATUSES },
  },
  additionalProperties: false,
};
