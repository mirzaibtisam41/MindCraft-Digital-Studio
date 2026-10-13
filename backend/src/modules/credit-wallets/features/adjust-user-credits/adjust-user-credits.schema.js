import {
  CREDIT_ADJUSTMENT_MAX,
  CREDIT_ADJUSTMENT_REASON_MAX_LENGTH,
} from '#src/modules/credit-transactions/credit-transaction.constants.js';

export const adjustUserCreditsBodySchema = {
  type: 'object',
  required: ['amount', 'reason'],
  properties: {
    amount: {
      type: 'integer',
      minimum: -CREDIT_ADJUSTMENT_MAX,
      maximum: CREDIT_ADJUSTMENT_MAX,
      not: { const: 0 },
    },
    reason: {
      type: 'string',
      minLength: 1,
      maxLength: CREDIT_ADJUSTMENT_REASON_MAX_LENGTH,
      pattern: '\\S',
    },
  },
  additionalProperties: false,
};
