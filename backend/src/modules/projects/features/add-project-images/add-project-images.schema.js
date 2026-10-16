import { uuidListSchema } from '#src/shared/schemas/uuid-list.schema.js';

export const addProjectImagesBodySchema = {
  type: 'object',
  required: ['imageIds'],
  properties: {
    imageIds: uuidListSchema,
    collectionId: { type: ['string', 'null'], format: 'uuid' },
  },
  additionalProperties: false,
};
