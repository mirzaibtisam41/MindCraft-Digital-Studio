import { GENERATION_PROMPT_MAX_LENGTH } from '#src/modules/generations/generation.constants.js';
import { ASPECT_RATIO_PATTERN } from '#src/modules/user-settings/user-setting.constants.js';

export const generateImagesBodySchema = {
  type: 'object',
  required: ['prompt'],
  properties: {
    prompt: {
      type: 'string',
      minLength: 1,
      maxLength: GENERATION_PROMPT_MAX_LENGTH,
    },
    model: { type: 'string', minLength: 1, maxLength: 100 },
    size: { type: 'string', minLength: 1, maxLength: 20 },
    aspectRatio: {
      type: 'string',
      pattern: ASPECT_RATIO_PATTERN,
      maxLength: 20,
    },
    quality: { type: 'string', minLength: 1, maxLength: 20 },
    n: { type: 'integer', minimum: 1 },
    background: { type: 'string', minLength: 1, maxLength: 20 },
    outputFormat: { type: 'string', minLength: 1, maxLength: 20 },
    seed: { type: 'integer' },
    negativePrompt: { type: 'string', maxLength: GENERATION_PROMPT_MAX_LENGTH },
    strength: { type: 'number' },
  },
  additionalProperties: false,
};
