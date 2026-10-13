export const revokeSessionParamsSchema = {
  type: 'object',
  required: ['familyId'],
  properties: {
    familyId: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};
