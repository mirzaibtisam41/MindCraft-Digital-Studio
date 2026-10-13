export const IMAGE_MODEL_ID_MAX_LENGTH = 100;

export const IMAGE_MODEL_PROVIDER_MAX_LENGTH = 50;

export const IMAGE_MODEL_LABEL_MAX_LENGTH = 100;

export const IMAGE_MODEL_DESCRIPTION_MAX_LENGTH = 200;

export const IMAGE_MODEL_BADGE_MAX_LENGTH = 30;

export const IMAGE_MODEL_BADGE = {
  NEW: 'new',
  FAST: 'fast',
  BEST_QUALITY: 'best_quality',
  POPULAR: 'popular',
  BETA: 'beta',
};

export const IMAGE_MODEL_BADGES = Object.values(IMAGE_MODEL_BADGE);

export const IMAGE_MODEL_TOOL = {
  TEXT_TO_IMAGE: 'text_to_image',
  IMAGE_TO_IMAGE: 'image_to_image',
  IMAGE_EDITING: 'image_editing',
};

export const IMAGE_MODEL_TOOLS = Object.values(IMAGE_MODEL_TOOL);

export const IMAGE_MODEL_TOOL_FEATURE = {
  [IMAGE_MODEL_TOOL.TEXT_TO_IMAGE]: 'textToImage',
  [IMAGE_MODEL_TOOL.IMAGE_TO_IMAGE]: 'referenceImages',
  [IMAGE_MODEL_TOOL.IMAGE_EDITING]: 'imageEditing',
};

export const IMAGE_MODEL_DEFAULT_TOOLS = [IMAGE_MODEL_TOOL.TEXT_TO_IMAGE];

export const IMAGE_MODEL_PROVIDER_COST_MAX_USD = 100;
