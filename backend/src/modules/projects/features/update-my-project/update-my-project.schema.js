import {
  projectDescriptionSchema,
  projectNameSchema,
} from '#src/modules/projects/shared/schemas/project-fields.schema.js';

export const updateMyProjectBodySchema = {
  type: 'object',
  minProperties: 1,
  properties: {
    name: projectNameSchema,
    description: projectDescriptionSchema,
    coverImageId: { type: ['string', 'null'], format: 'uuid' },
  },
  additionalProperties: false,
};
