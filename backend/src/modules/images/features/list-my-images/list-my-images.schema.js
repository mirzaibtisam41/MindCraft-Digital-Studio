import { IMAGE_SOURCES } from '#src/modules/images/image.constants.js';
import { paginationQuerySchema } from '#src/shared/schemas/pagination-query.schema.js';

export const listMyImagesQuerySchema = {
  type: 'object',
  properties: {
    ...paginationQuerySchema.properties,
    source: { type: 'string', enum: IMAGE_SOURCES },
  },
  additionalProperties: false,
};
