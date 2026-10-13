import { IMAGE_MODEL_ID_MAX_LENGTH } from '#src/modules/image-models/image-model.constants.js';

export const modelIdParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', minLength: 1, maxLength: IMAGE_MODEL_ID_MAX_LENGTH },
  },
  additionalProperties: false,
};
