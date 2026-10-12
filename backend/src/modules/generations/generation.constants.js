export const GENERATION_TYPE = {
  TEXT_TO_IMAGE: 'text_to_image',
};

export const GENERATION_TYPES = Object.values(GENERATION_TYPE);

export const GENERATION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

export const GENERATION_STATUSES = Object.values(GENERATION_STATUS);

export const GENERATION_PROMPT_MAX_LENGTH = 4000;

export const GENERATION_PROVIDER_MAX_LENGTH = 50;

export const GENERATION_MODEL_MAX_LENGTH = 100;

export const GENERATION_ERROR_CATEGORY_MAX_LENGTH = 50;

export const GENERATION_ERROR_MESSAGE_MAX_LENGTH = 500;
