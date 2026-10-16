import { paginationQuerySchema } from '#src/shared/schemas/pagination-query.schema.js';

export const listMyProjectsQuerySchema = {
  type: 'object',
  properties: {
    ...paginationQuerySchema.properties,
    search: { type: 'string', maxLength: 100 },
  },
  additionalProperties: false,
};
