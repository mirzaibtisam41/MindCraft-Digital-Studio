import {
  AI_MODEL_DESCRIPTION_MAX_LENGTH,
  AI_MODEL_NAME_MAX_LENGTH,
} from '#src/modules/ai-models/ai-model.constants.js';

export const updateAiModelBodySchema = {
  type: 'object',
  minProperties: 1,
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: AI_MODEL_NAME_MAX_LENGTH,
      pattern: '\\S',
    },
    description: {
      type: ['string', 'null'],
      maxLength: AI_MODEL_DESCRIPTION_MAX_LENGTH,
    },
    sortOrder: { type: 'integer', minimum: 0 },
  },
  additionalProperties: false,
};
