import { uuidListSchema } from '#src/shared/schemas/uuid-list.schema.js';

export const bulkFavoriteMyImagesBodySchema = {
  type: 'object',
  required: ['ids', 'isFavorite'],
  properties: {
    ids: uuidListSchema,
    isFavorite: { type: 'boolean' },
  },
  additionalProperties: false,
};
