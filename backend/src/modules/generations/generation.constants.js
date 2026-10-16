export const GENERATION_STATUS = {
  PROCESSING: 'processing',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
};

export const GENERATION_STATUSES = Object.values(GENERATION_STATUS);

export const GENERATION_TYPE_CODE = {
  TEXT_TO_IMAGE: 'text_to_image',
  IMAGE_TO_IMAGE: 'image_to_image',
  IMAGE_EDIT: 'image_edit',
};

export const GENERATION_TYPE_CODES = Object.values(GENERATION_TYPE_CODE);
