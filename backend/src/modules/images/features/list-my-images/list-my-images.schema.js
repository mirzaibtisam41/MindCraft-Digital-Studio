import { IMAGE_SOURCES } from '#src/modules/images/image.constants.js';
import { paginationQuerySchema } from '#src/shared/schemas/pagination-query.schema.js';

export const listMyImagesQuerySchema = {
  type: 'object',
  properties: {
    ...paginationQuerySchema.properties,
    source: { type: 'string', enum: IMAGE_SOURCES },
    modelId: { type: 'string', format: 'uuid' },
    since: { type: 'string', enum: ['7d', '30d'] },
    favorite: { type: 'boolean' },
    search: { type: 'string', maxLength: 200 },
  },
  additionalProperties: false,
};
