export const listModelWorkflowsParamsSchema = {
  type: 'object',
  required: ['modelId'],
  properties: {
    modelId: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};
