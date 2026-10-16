import { paginationQuerySchema } from '#src/shared/schemas/pagination-query.schema.js';

export const listProjectImagesQuerySchema = {
  type: 'object',
  properties: {
    ...paginationQuerySchema.properties,
    collectionId: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};
