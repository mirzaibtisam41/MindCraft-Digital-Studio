import { AI_MODEL_STATUSES } from '#src/modules/ai-models/ai-model.constants.js';

export const updateAiModelStatusBodySchema = {
  type: 'object',
  required: ['status'],
  properties: {
    status: { type: 'string', enum: AI_MODEL_STATUSES },
  },
  additionalProperties: false,
};
