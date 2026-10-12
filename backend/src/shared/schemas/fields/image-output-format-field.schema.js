import { IMAGE_OUTPUT_FORMATS } from '#src/constants/index.js';

export const imageOutputFormatFieldSchema = {
  type: 'string',
  enum: IMAGE_OUTPUT_FORMATS,
};
