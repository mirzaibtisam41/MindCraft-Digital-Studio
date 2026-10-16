import { uuidListSchema } from '#src/shared/schemas/uuid-list.schema.js';

export const moveProjectImagesBodySchema = {
  type: 'object',
  required: ['imageIds', 'collectionId'],
  properties: {
    imageIds: uuidListSchema,
    collectionId: { type: ['string', 'null'], format: 'uuid' },
  },
  additionalProperties: false,
};
