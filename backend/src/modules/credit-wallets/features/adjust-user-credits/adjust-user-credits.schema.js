export const adjustUserCreditsBodySchema = {
  type: 'object',
  required: ['amount', 'reason'],
  properties: {
    amount: {
      type: 'integer',
      minimum: -100000,
      maximum: 100000,
      not: { const: 0 },
    },
    reason: {
      type: 'string',
      minLength: 1,
      maxLength: 500,
      pattern: '\\S',
    },
  },
  additionalProperties: false,
};
