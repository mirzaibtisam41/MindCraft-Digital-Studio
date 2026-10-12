import { GENERATION_MODEL_MAX_LENGTH } from '#src/modules/generations/generation.constants.js';

export const modelFieldSchema = {
  type: 'string',
  minLength: 1,
  maxLength: GENERATION_MODEL_MAX_LENGTH,
};
