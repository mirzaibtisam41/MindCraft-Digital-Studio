export const listImageAnalysesQuerySchema = {
  type: 'object',
  required: ['imageId'],
  properties: {
    imageId: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};
