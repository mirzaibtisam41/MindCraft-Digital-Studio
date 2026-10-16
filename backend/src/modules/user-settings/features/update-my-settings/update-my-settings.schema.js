import { GENERATION_OPTIONS } from '#src/modules/model-workflows/generation-options.constants.js';

export const updateMySettingsBodySchema = {
  type: 'object',
  minProperties: 1,
  properties: {
    defaultModelId: {
      anyOf: [{ type: 'string', format: 'uuid' }, { type: 'null' }],
    },
    defaultSize: {
      anyOf: [
        { type: 'string', enum: GENERATION_OPTIONS.sizes },
        { type: 'null' },
      ],
    },
    defaultQuality: {
      anyOf: [
        { type: 'string', enum: GENERATION_OPTIONS.qualities },
        { type: 'null' },
      ],
    },
    defaultImageCount: {
      anyOf: [
        {
          type: 'integer',
          minimum: 1,
          maximum: GENERATION_OPTIONS.maxImagesPerRequest,
        },
        { type: 'null' },
      ],
    },
    notifyGenerationFailed: { type: 'boolean' },
    notifyCreditChanges: { type: 'boolean' },
    notifyLowCredits: { type: 'boolean' },
    lowCreditThreshold: { type: 'integer', minimum: 1, maximum: 100000 },
  },
  additionalProperties: false,
};
