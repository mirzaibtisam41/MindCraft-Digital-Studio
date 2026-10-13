import {
  ADMIN_EDITABLE_IMAGE_BACKGROUNDS,
  ADMIN_EDITABLE_IMAGE_MODERATIONS,
  ADMIN_EDITABLE_IMAGE_QUALITIES,
  ADMIN_EDITABLE_IMAGE_SIZES,
  ADMIN_MAX_IMAGES_PER_REQUEST,
  IMAGE_MODEL_CREDITS_MAX,
  IMAGE_MODEL_CREDITS_MIN,
  IMAGE_MODEL_SORT_ORDER_MAX,
} from '#src/modules/admin/admin.constants.js';
import { IMAGE_MODEL_LABEL_MAX_LENGTH } from '#src/modules/image-models/image-model.constants.js';

function enumArraySchema(values) {
  return {
    type: 'array',
    minItems: 1,
    uniqueItems: true,
    items: { type: 'string', enum: values },
  };
}

export const creditsPerImageSchema = {
  type: 'object',
  minProperties: 1,
  properties: Object.fromEntries(
    ADMIN_EDITABLE_IMAGE_QUALITIES.map((quality) => [
      quality,
      {
        type: 'integer',
        minimum: IMAGE_MODEL_CREDITS_MIN,
        maximum: IMAGE_MODEL_CREDITS_MAX,
      },
    ]),
  ),
  additionalProperties: false,
};

const defaultsSchema = {
  type: 'object',
  minProperties: 1,
  properties: {
    size: { type: 'string', enum: ADMIN_EDITABLE_IMAGE_SIZES },
    quality: { type: 'string', enum: ADMIN_EDITABLE_IMAGE_QUALITIES },
    n: { type: 'integer', minimum: 1, maximum: ADMIN_MAX_IMAGES_PER_REQUEST },
    background: { type: 'string', enum: ADMIN_EDITABLE_IMAGE_BACKGROUNDS },
    moderation: { type: 'string', enum: ADMIN_EDITABLE_IMAGE_MODERATIONS },
  },
  additionalProperties: false,
};

export const capabilitiesSchema = {
  type: 'object',
  minProperties: 1,
  properties: {
    sizes: enumArraySchema(ADMIN_EDITABLE_IMAGE_SIZES),
    qualities: enumArraySchema(ADMIN_EDITABLE_IMAGE_QUALITIES),
    backgrounds: enumArraySchema(ADMIN_EDITABLE_IMAGE_BACKGROUNDS),
    moderations: enumArraySchema(ADMIN_EDITABLE_IMAGE_MODERATIONS),
    maxImagesPerRequest: {
      type: 'integer',
      minimum: 1,
      maximum: ADMIN_MAX_IMAGES_PER_REQUEST,
    },
    defaults: defaultsSchema,
  },
  additionalProperties: false,
};

export const updateImageModelBodySchema = {
  type: 'object',
  minProperties: 1,
  properties: {
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
    creditsPerImage: creditsPerImageSchema,
    capabilities: capabilitiesSchema,
  },
  additionalProperties: false,
};
