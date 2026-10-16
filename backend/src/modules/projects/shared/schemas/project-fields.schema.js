import {
  PROJECT_COLLECTION_NAME_MAX_LENGTH,
  PROJECT_DESCRIPTION_MAX_LENGTH,
  PROJECT_NAME_MAX_LENGTH,
} from '#src/modules/projects/project.constants.js';

export const projectNameSchema = {
  type: 'string',
  minLength: 1,
  maxLength: PROJECT_NAME_MAX_LENGTH,
  pattern: '\\S',
};

export const projectDescriptionSchema = {
  type: ['string', 'null'],
  maxLength: PROJECT_DESCRIPTION_MAX_LENGTH,
};

export const projectCollectionBodySchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: PROJECT_COLLECTION_NAME_MAX_LENGTH,
      pattern: '\\S',
    },
  },
  additionalProperties: false,
};
