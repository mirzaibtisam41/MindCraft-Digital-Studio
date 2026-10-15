import { GENERATION_OPTIONS } from '#src/modules/model-workflows/generation-options.constants.js';

const creditsPerImageSchema = {
  type: 'integer',
  minimum: 1,
  maximum: 100000,
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
