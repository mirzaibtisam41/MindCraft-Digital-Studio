import {
  AI_MODEL_NAME_MAX_LENGTH,
  AI_MODEL_STATUSES,
} from '#src/modules/ai-models/ai-model.constants.js';

export const listAiModelsQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: {
      type: 'integer',
      minimum: 1,
      maximum: 100,
      default: 20,
    },
    search: { type: 'string', maxLength: AI_MODEL_NAME_MAX_LENGTH },
    providerId: { type: 'string', format: 'uuid' },
    status: { type: 'string', enum: AI_MODEL_STATUSES },
  },
  additionalProperties: false,
};
