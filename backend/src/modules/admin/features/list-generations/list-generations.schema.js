import { paginationQueryProperties } from '#src/modules/admin/shared/schemas/pagination-query.schema.js';
import { GENERATION_STATUSES } from '#src/modules/generations/generation.constants.js';

export const listGenerationsQuerySchema = {
  type: 'object',
  properties: {
    ...paginationQueryProperties,
    status: { type: 'string', enum: GENERATION_STATUSES },
    userId: { type: 'string', format: 'uuid' },
    model: { type: 'string', minLength: 1, maxLength: 100 },
  },
  additionalProperties: false,
};
