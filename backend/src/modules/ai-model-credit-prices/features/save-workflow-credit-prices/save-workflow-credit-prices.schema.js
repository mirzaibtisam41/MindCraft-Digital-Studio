import { GENERATION_OPTIONS } from '#src/modules/ai-model-generation-types/generation-options.constants.js';
import { CREDITS_PER_IMAGE_MAX } from '#src/modules/ai-model-credit-prices/ai-model-credit-price.constants.js';

const creditsPerImageSchema = {
  type: 'integer',
  minimum: 1,
  maximum: CREDITS_PER_IMAGE_MAX,
};

export const saveWorkflowCreditPricesParamsSchema = {
  type: 'object',
  required: ['modelId', 'typeId'],
  properties: {
    modelId: { type: 'string', format: 'uuid' },
    typeId: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};

export const saveWorkflowCreditPricesBodySchema = {
  type: 'object',
  required: ['prices'],
  properties: {
    prices: {
      type: 'object',
      propertyNames: { enum: GENERATION_OPTIONS.qualities },
      additionalProperties: creditsPerImageSchema,
    },
  },
  additionalProperties: false,
};
