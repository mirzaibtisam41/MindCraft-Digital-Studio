import { AI_PROVIDER_NAME_MAX_LENGTH } from '#src/modules/ai-providers/ai-provider.constants.js';

export const updateAiProviderBodySchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: AI_PROVIDER_NAME_MAX_LENGTH,
      pattern: '\\S',
    },
  },
  additionalProperties: false,
};
