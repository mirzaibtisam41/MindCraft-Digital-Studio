import {
  AI_PROVIDER_CODE_MAX_LENGTH,
  AI_PROVIDER_NAME_MAX_LENGTH,
} from '#src/modules/ai-providers/ai-provider.constants.js';

export const updateAiProviderBodySchema = {
  type: 'object',
  minProperties: 1,
  properties: {
    code: {
      type: 'string',
      minLength: 1,
      maxLength: AI_PROVIDER_CODE_MAX_LENGTH,
      pattern: '^[a-zA-Z0-9-]+$',
    },
    name: {
      type: 'string',
      minLength: 1,
      maxLength: AI_PROVIDER_NAME_MAX_LENGTH,
      pattern: '\\S',
    },
  },
  additionalProperties: false,
};
