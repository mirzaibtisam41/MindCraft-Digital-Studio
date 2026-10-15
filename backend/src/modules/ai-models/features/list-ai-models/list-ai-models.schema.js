import {
  AI_MODEL_NAME_MAX_LENGTH,
  AI_MODEL_STATUSES,
} from '#src/modules/ai-models/ai-model.constants.js';
import { paginationQuerySchema } from '#src/shared/schemas/pagination-query.schema.js';

export const listAiModelsQuerySchema = {
  type: 'object',
  properties: {
    ...paginationQuerySchema.properties,
    search: { type: 'string', maxLength: AI_MODEL_NAME_MAX_LENGTH },
    providerId: { type: 'string', format: 'uuid' },
    status: { type: 'string', enum: AI_MODEL_STATUSES },
  },
  additionalProperties: false,
};
