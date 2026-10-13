import {
  ADMIN_EDITABLE_IMAGE_BACKGROUNDS,
  ADMIN_EDITABLE_IMAGE_MODERATIONS,
  ADMIN_EDITABLE_IMAGE_OUTPUT_FORMATS,
  ADMIN_EDITABLE_IMAGE_QUALITIES,
  ADMIN_EDITABLE_IMAGE_SIZES,
  ADMIN_MAX_IMAGES_PER_REQUEST,
  IMAGE_MODEL_CREDITS_MAX,
  IMAGE_MODEL_CREDITS_MIN,
  IMAGE_MODEL_SORT_ORDER_MAX,
} from '#src/modules/admin/admin.constants.js';
import {
  IMAGE_MODEL_BADGES,
  IMAGE_MODEL_DESCRIPTION_MAX_LENGTH,
  IMAGE_MODEL_LABEL_MAX_LENGTH,
  IMAGE_MODEL_PROVIDER_COST_MAX_USD,
  IMAGE_MODEL_TOOLS,
} from '#src/modules/image-models/image-model.constants.js';

function enumArraySchema(values) {
  return {
    type: 'array',
    minItems: 1,
    uniqueItems: true,
    items: { type: 'string', enum: values },
  };
}

function perQualitySchema(valueSchema) {
  return {
    type: 'object',
    minProperties: 1,
    properties: Object.fromEntries(
      ADMIN_EDITABLE_IMAGE_QUALITIES.map((quality) => [quality, valueSchema]),
    ),
    additionalProperties: false,
  };
}

export const creditsPerImageSchema = perQualitySchema({
  type: 'integer',
  minimum: IMAGE_MODEL_CREDITS_MIN,
  maximum: IMAGE_MODEL_CREDITS_MAX,
});

export const providerCostPerImageSchema = perQualitySchema({
  type: 'number',
  minimum: 0,
  maximum: IMAGE_MODEL_PROVIDER_COST_MAX_USD,
});

export const labelSchema = {
  type: 'string',
  minLength: 1,
  maxLength: IMAGE_MODEL_LABEL_MAX_LENGTH,
};

export const descriptionSchema = {
  type: 'string',
  maxLength: IMAGE_MODEL_DESCRIPTION_MAX_LENGTH,
};

export const badgeSchema = {
  anyOf: [{ type: 'string', enum: IMAGE_MODEL_BADGES }, { type: 'null' }],
};

export const toolsSchema = enumArraySchema(IMAGE_MODEL_TOOLS);

export const sortOrderSchema = {
  type: 'integer',
  minimum: 0,
  maximum: IMAGE_MODEL_SORT_ORDER_MAX,
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
    outputFormat: {
      type: 'string',
      enum: ADMIN_EDITABLE_IMAGE_OUTPUT_FORMATS,
    },
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
    outputFormats: enumArraySchema(ADMIN_EDITABLE_IMAGE_OUTPUT_FORMATS),
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
    label: labelSchema,
    description: descriptionSchema,
    badge: badgeSchema,
    enabled: { type: 'boolean' },
    isDefault: { type: 'boolean' },
    sortOrder: sortOrderSchema,
    tools: toolsSchema,
    creditsPerImage: creditsPerImageSchema,
    providerCostPerImage: providerCostPerImageSchema,
    capabilities: capabilitiesSchema,
  },
  additionalProperties: false,
};
