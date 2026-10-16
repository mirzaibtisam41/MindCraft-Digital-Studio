import {
  projectDescriptionSchema,
  projectNameSchema,
} from '#src/modules/projects/shared/schemas/project-fields.schema.js';

export const createProjectBodySchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: projectNameSchema,
    description: projectDescriptionSchema,
  },
  additionalProperties: false,
};
