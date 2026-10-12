export const IMAGE_SIZE = {
  SQUARE: '1024x1024',
  PORTRAIT: '1024x1536',
  LANDSCAPE: '1536x1024',
};

export const IMAGE_SIZES = Object.values(IMAGE_SIZE);

export const IMAGE_QUALITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

export const IMAGE_QUALITIES = Object.values(IMAGE_QUALITY);

export const MAX_IMAGES_PER_REQUEST = 10;
export const MAX_REFERENCE_IMAGES = 16;

export const IMAGE_BACKGROUND = {
  AUTO: 'auto',
  OPAQUE: 'opaque',
  TRANSPARENT: 'transparent',
};

export const IMAGE_BACKGROUNDS = Object.values(IMAGE_BACKGROUND);

export const MIN_IMAGES_PER_REQUEST = 1;

export const DEFAULT_IMAGE_SIZE = IMAGE_SIZE.SQUARE;
export const DEFAULT_IMAGE_QUALITY = IMAGE_QUALITY.MEDIUM;
export const DEFAULT_IMAGES_PER_REQUEST = 1;
export const DEFAULT_IMAGE_BACKGROUND = IMAGE_BACKGROUND.AUTO;
