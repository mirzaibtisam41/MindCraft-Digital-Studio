export const updateGenerationTypeStatusBodySchema = {
  type: 'object',
  required: ['isActive'],
  properties: {
    isActive: { type: 'boolean' },
  },
  additionalProperties: false,
};
