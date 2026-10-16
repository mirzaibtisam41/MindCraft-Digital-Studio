import { uuidListSchema } from '#src/shared/schemas/uuid-list.schema.js';

export const removeProjectImagesBodySchema = {
  type: 'object',
  required: ['imageIds'],
  properties: {
    imageIds: uuidListSchema,
  },
  additionalProperties: false,
};
