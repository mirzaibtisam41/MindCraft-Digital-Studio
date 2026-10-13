import {
  IMAGE_BACKGROUND,
  IMAGE_MODERATIONS,
  IMAGE_QUALITIES,
  IMAGE_SIZES,
  MAX_IMAGES_PER_REQUEST,
} from '#src/constants/index.js';

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

export const ADMIN_EDITABLE_IMAGE_BACKGROUNDS = [
  IMAGE_BACKGROUND.AUTO,
  IMAGE_BACKGROUND.OPAQUE,
];

export const ADMIN_EDITABLE_IMAGE_SIZES = IMAGE_SIZES;

export const ADMIN_EDITABLE_IMAGE_QUALITIES = IMAGE_QUALITIES;

export const ADMIN_EDITABLE_IMAGE_MODERATIONS = IMAGE_MODERATIONS;

export const ADMIN_MAX_IMAGES_PER_REQUEST = MAX_IMAGES_PER_REQUEST;

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
