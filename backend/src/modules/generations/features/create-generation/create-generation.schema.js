import { GENERATION_OPTIONS } from '#src/modules/model-workflows/generation-options.constants.js';
import { GENERATION_TYPE_CODES } from '#src/modules/generations/generation.constants.js';

export const createGenerationBodySchema = {
  type: 'object',
  required: ['modelId', 'prompt', 'options'],
  properties: {
    type: { type: 'string', enum: GENERATION_TYPE_CODES },
    modelId: { type: 'string', format: 'uuid' },
    sourceImageId: { type: 'string', format: 'uuid' },
    mask: {
      type: 'string',
      maxLength: 12 * 1024 * 1024,
      pattern: '^data:image/png;base64,',
    },
    prompt: { type: 'string', minLength: 1, maxLength: 2000, pattern: '\\S' },
    options: {
      type: 'object',
      required: ['size', 'quality', 'outputFormat', 'n'],
      properties: {
        size: { type: 'string', enum: GENERATION_OPTIONS.sizes },
        quality: { type: 'string', enum: GENERATION_OPTIONS.qualities },
        outputFormat: {
          type: 'string',
          enum: GENERATION_OPTIONS.outputFormats,
        },
        n: {
          type: 'integer',
          minimum: 1,
          maximum: GENERATION_OPTIONS.maxImagesPerRequest,
        },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
};
