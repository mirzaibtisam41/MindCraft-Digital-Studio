import {
  GENERATION_TYPE_CODE_MAX_LENGTH,
  GENERATION_TYPE_DESCRIPTION_MAX_LENGTH,
  GENERATION_TYPE_NAME_MAX_LENGTH,
} from '#src/modules/generation-types/generation-type.constants.js';

export const createGenerationTypeBodySchema = {
  type: 'object',
  required: ['code', 'name'],
  properties: {
    code: {
      type: 'string',
      minLength: 1,
      maxLength: GENERATION_TYPE_CODE_MAX_LENGTH,
      pattern: '^[a-zA-Z0-9_]+$',
    },
    name: {
      type: 'string',
      minLength: 1,
      maxLength: GENERATION_TYPE_NAME_MAX_LENGTH,
      pattern: '\\S',
    },
    description: {
      type: 'string',
      maxLength: GENERATION_TYPE_DESCRIPTION_MAX_LENGTH,
    },
    isActive: { type: 'boolean', default: true },
  },
  additionalProperties: false,
};
