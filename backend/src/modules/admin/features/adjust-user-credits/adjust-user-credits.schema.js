import { CREDIT_ADJUSTMENT_MAX } from '#src/modules/admin/admin.constants.js';
import { CREDIT_NOTE_MAX_LENGTH } from '#src/modules/credits/credit.constants.js';

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
    reason: { type: 'string', minLength: 3, maxLength: CREDIT_NOTE_MAX_LENGTH },
  },
  additionalProperties: false,
};
