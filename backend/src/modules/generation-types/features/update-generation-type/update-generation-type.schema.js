import {
  GENERATION_TYPE_DESCRIPTION_MAX_LENGTH,
  GENERATION_TYPE_NAME_MAX_LENGTH,
} from '#src/modules/generation-types/generation-type.constants.js';

export const updateGenerationTypeBodySchema = {
  type: 'object',
  minProperties: 1,
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: GENERATION_TYPE_NAME_MAX_LENGTH,
      pattern: '\\S',
    },
    description: {
      type: ['string', 'null'],
      maxLength: GENERATION_TYPE_DESCRIPTION_MAX_LENGTH,
    },
  },
  additionalProperties: false,
};
