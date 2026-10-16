import { GENERATION_STATUSES } from '#src/modules/generations/generation.constants.js';
import { paginationQuerySchema } from '#src/shared/schemas/pagination-query.schema.js';

export const listMyGenerationsQuerySchema = {
  type: 'object',
  properties: {
    ...paginationQuerySchema.properties,
    status: { type: 'string', enum: GENERATION_STATUSES },
    modelId: { type: 'string', format: 'uuid' },
    search: { type: 'string', maxLength: 200 },
  },
  additionalProperties: false,
};
