export const updateAiProviderStatusBodySchema = {
  type: 'object',
  required: ['isActive'],
  properties: {
    isActive: { type: 'boolean' },
  },
  additionalProperties: false,
};
