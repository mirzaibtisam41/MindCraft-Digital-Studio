export const updateMyImageBodySchema = {
  type: 'object',
  required: ['isFavorite'],
  properties: {
    isFavorite: { type: 'boolean' },
  },
  additionalProperties: false,
};
