import { IMAGE_QUALITIES } from '#src/constants/index.js';

export const imageQualityFieldSchema = {
  type: 'string',
  enum: IMAGE_QUALITIES,
};
