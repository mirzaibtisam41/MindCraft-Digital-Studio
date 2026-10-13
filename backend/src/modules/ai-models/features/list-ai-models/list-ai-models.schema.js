import {
  AI_MODEL_LIST_DEFAULT_LIMIT,
  AI_MODEL_LIST_MAX_LIMIT,
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
      maximum: AI_MODEL_LIST_MAX_LIMIT,
      default: AI_MODEL_LIST_DEFAULT_LIMIT,
    },
    search: { type: 'string', maxLength: AI_MODEL_NAME_MAX_LENGTH },
    providerId: { type: 'string', format: 'uuid' },
    status: { type: 'string', enum: AI_MODEL_STATUSES },
  },
  additionalProperties: false,
};
