import { uuidListSchema } from '#src/shared/schemas/uuid-list.schema.js';

export const bulkDeleteMyImagesBodySchema = {
  type: 'object',
  required: ['ids'],
  properties: {
    ids: uuidListSchema,
  },
  additionalProperties: false,
};
