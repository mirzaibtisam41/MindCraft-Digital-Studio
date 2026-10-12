import { AI_IMAGE_PROVIDERS } from '#src/constants/index.js';
import {
  ADMIN_EDITABLE_IMAGE_QUALITIES,
  IMAGE_MODEL_SORT_ORDER_MAX,
} from '#src/modules/admin/admin.constants.js';
import { IMAGE_MODEL_ID_PATTERN } from '#src/modules/admin/new-image-model-baseline.constants.js';
import {
  IMAGE_MODEL_ID_MAX_LENGTH,
  IMAGE_MODEL_LABEL_MAX_LENGTH,
} from '#src/modules/image-models/image-model.constants.js';
import {
  capabilitiesSchema,
  creditsPerImageSchema,
} from '#src/modules/admin/features/update-image-model/update-image-model.schema.js';

export const createImageModelBodySchema = {
  type: 'object',
  required: ['id', 'provider', 'label', 'creditsPerImage'],
  properties: {
    id: {
      type: 'string',
      minLength: 1,
      maxLength: IMAGE_MODEL_ID_MAX_LENGTH,
      pattern: IMAGE_MODEL_ID_PATTERN,
    },
    provider: { type: 'string', enum: AI_IMAGE_PROVIDERS },
    label: {
      type: 'string',
      minLength: 1,
      maxLength: IMAGE_MODEL_LABEL_MAX_LENGTH,
    },
    enabled: { type: 'boolean' },
    sortOrder: {
      type: 'integer',
      minimum: 0,
      maximum: IMAGE_MODEL_SORT_ORDER_MAX,
    },
    creditsPerImage: {
      ...creditsPerImageSchema,
      required: ADMIN_EDITABLE_IMAGE_QUALITIES,
    },
    capabilities: capabilitiesSchema,
  },
  additionalProperties: false,
};
