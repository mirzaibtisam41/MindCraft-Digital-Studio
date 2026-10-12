import { IMAGE_SIZES } from '#src/constants/index.js';

export const imageSizeFieldSchema = {
  type: 'string',
  enum: IMAGE_SIZES,
};
