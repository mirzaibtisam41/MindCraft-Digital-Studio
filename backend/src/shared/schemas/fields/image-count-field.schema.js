import {
  MAX_IMAGES_PER_REQUEST,
  MIN_IMAGES_PER_REQUEST,
} from '#src/constants/index.js';

export const imageCountFieldSchema = {
  type: 'integer',
  minimum: MIN_IMAGES_PER_REQUEST,
  maximum: MAX_IMAGES_PER_REQUEST,
};
