import { AI_IMAGE_PROVIDERS } from '#src/constants/index.js';
import { ADMIN_EDITABLE_IMAGE_QUALITIES } from '#src/modules/admin/admin.constants.js';
import { IMAGE_MODEL_ID_PATTERN } from '#src/modules/admin/new-image-model-baseline.constants.js';
import { IMAGE_MODEL_ID_MAX_LENGTH } from '#src/modules/image-models/image-model.constants.js';
import {
  badgeSchema,
  capabilitiesSchema,
  creditsPerImageSchema,
  descriptionSchema,
  labelSchema,
  providerCostPerImageSchema,
  sortOrderSchema,
  toolsSchema,
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
    label: labelSchema,
    description: descriptionSchema,
    badge: badgeSchema,
    enabled: { type: 'boolean' },
    sortOrder: sortOrderSchema,
    tools: toolsSchema,
    creditsPerImage: {
      ...creditsPerImageSchema,
      required: ADMIN_EDITABLE_IMAGE_QUALITIES,
    },
    providerCostPerImage: providerCostPerImageSchema,
    capabilities: capabilitiesSchema,
  },
  additionalProperties: false,
};
