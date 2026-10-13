export const GENERATION_TYPE_CODE_MAX_LENGTH = 60;

export const GENERATION_TYPE_NAME_MAX_LENGTH = 100;

export const GENERATION_TYPE_CODE = {
  TEXT_TO_IMAGE: 'text_to_image',
  IMAGE_EDIT: 'image_edit',
  IMAGE_TO_IMAGE: 'image_to_image',
};

export const GENERATION_TYPE_DESCRIPTION_MAX_LENGTH = 500;

export const GENERATION_TYPE_NOT_FOUND_MESSAGE = 'Generation type not found';

export const GENERATION_TYPE_CODE_TAKEN_MESSAGE =
  'A generation type with this code already exists';

export const GENERATION_TYPE_IN_USE_MESSAGE =
  'This generation type is used by models and cannot be deleted. Turn it off instead.';
