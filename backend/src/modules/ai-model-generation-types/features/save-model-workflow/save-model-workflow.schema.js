import { GENERATION_OPTIONS } from '#src/modules/ai-model-generation-types/generation-options.constants.js';

function listOf(values) {
  return {
    type: 'array',
    minItems: 1,
    uniqueItems: true,
    items: { type: 'string', enum: values },
  };
}

export const saveModelWorkflowParamsSchema = {
  type: 'object',
  required: ['modelId', 'typeId'],
  properties: {
    modelId: { type: 'string', format: 'uuid' },
    typeId: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};

export const saveModelWorkflowBodySchema = {
  type: 'object',
  required: ['isEnabled'],
  properties: {
    isEnabled: { type: 'boolean' },
    enabledOptions: {
      type: ['object', 'null'],
      required: ['sizes', 'qualities', 'outputFormats', 'maxImagesPerRequest'],
      properties: {
        sizes: listOf(GENERATION_OPTIONS.sizes),
        qualities: listOf(GENERATION_OPTIONS.qualities),
        outputFormats: listOf(GENERATION_OPTIONS.outputFormats),
        maxImagesPerRequest: {
          type: 'integer',
          minimum: 1,
          maximum: GENERATION_OPTIONS.maxImagesPerRequest,
        },
      },
      additionalProperties: false,
    },
    defaultOptions: {
      type: ['object', 'null'],
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
