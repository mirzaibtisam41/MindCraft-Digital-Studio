import {
  IMAGE_BACKGROUND,
  IMAGE_MODERATIONS,
  IMAGE_OUTPUT_FORMATS,
  IMAGE_QUALITIES,
  IMAGE_SIZES,
  MAX_IMAGES_PER_REQUEST,
} from '#src/constants/index.js';
import {
  IMAGE_MODEL_BADGES,
  IMAGE_MODEL_DESCRIPTION_MAX_LENGTH,
  IMAGE_MODEL_PROVIDER_COST_MAX_USD,
  IMAGE_MODEL_TOOL_FEATURE,
  IMAGE_MODEL_TOOLS,
} from '#src/modules/image-models/image-model.constants.js';

export const ADMIN_PAGE_SIZE_DEFAULT = 20;

export const ADMIN_PAGE_SIZE_MAX = 100;

export const ADMIN_SEARCH_MAX_LENGTH = 100;

export const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
};

export const USER_STATUSES = Object.values(USER_STATUS);

export const CREDIT_ADJUSTMENT_MAX = 100000;

export const IMAGE_MODEL_CREDITS_MIN = 1;

export const IMAGE_MODEL_CREDITS_MAX = 1000;

export const IMAGE_MODEL_SORT_ORDER_MAX = 1000;

export const IMAGE_MODEL_RECENT_USAGE_DAYS = 30;

export const ADMIN_EDITABLE_IMAGE_BACKGROUNDS = [
  IMAGE_BACKGROUND.AUTO,
  IMAGE_BACKGROUND.OPAQUE,
];

export const ADMIN_EDITABLE_IMAGE_SIZES = IMAGE_SIZES;

export const ADMIN_EDITABLE_IMAGE_QUALITIES = IMAGE_QUALITIES;

export const ADMIN_EDITABLE_IMAGE_MODERATIONS = IMAGE_MODERATIONS;

export const ADMIN_EDITABLE_IMAGE_OUTPUT_FORMATS = IMAGE_OUTPUT_FORMATS;

export const ADMIN_MAX_IMAGES_PER_REQUEST = MAX_IMAGES_PER_REQUEST;

export const IMAGE_MODEL_EDITABLE_LIMITS = {
  sizes: ADMIN_EDITABLE_IMAGE_SIZES,
  qualities: ADMIN_EDITABLE_IMAGE_QUALITIES,
  backgrounds: ADMIN_EDITABLE_IMAGE_BACKGROUNDS,
  moderations: ADMIN_EDITABLE_IMAGE_MODERATIONS,
  outputFormats: ADMIN_EDITABLE_IMAGE_OUTPUT_FORMATS,
  maxImagesPerRequest: ADMIN_MAX_IMAGES_PER_REQUEST,
  creditsPerImage: {
    min: IMAGE_MODEL_CREDITS_MIN,
    max: IMAGE_MODEL_CREDITS_MAX,
  },
  providerCostPerImage: { min: 0, max: IMAGE_MODEL_PROVIDER_COST_MAX_USD },
  sortOrderMax: IMAGE_MODEL_SORT_ORDER_MAX,
  descriptionMaxLength: IMAGE_MODEL_DESCRIPTION_MAX_LENGTH,
  badges: IMAGE_MODEL_BADGES,
  tools: IMAGE_MODEL_TOOLS,
  toolFeatures: IMAGE_MODEL_TOOL_FEATURE,
};

export const DEFAULT_MODEL_MUST_BE_ENABLED_MESSAGE =
  'The default model must be enabled';

export const DISABLE_DEFAULT_MODEL_MESSAGE =
  'Make another model the default before disabling this one';

export const UNSET_DEFAULT_MODEL_MESSAGE =
  'Make another model the default instead of unsetting this one';

export const CANNOT_MODIFY_SELF_MESSAGE =
  'You cannot change your own role or suspension';

export const LAST_ENABLED_MODEL_MESSAGE =
  'At least one image model must stay enabled';

export const NEGATIVE_BALANCE_MESSAGE =
  'This adjustment would take the balance below zero';

export const OVERVIEW_RANGE_DAYS = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

export const OVERVIEW_RANGES = Object.keys(OVERVIEW_RANGE_DAYS);

export const OVERVIEW_RANGE_DEFAULT = '30d';

export const OVERVIEW_TIMEZONE_DEFAULT = 'UTC';

export const OVERVIEW_TIMEZONE_MAX_LENGTH = 64;

export const OVERVIEW_LIST_LIMIT = 6;

export const OVERVIEW_TOP_SPENDERS_LIMIT = 5;
