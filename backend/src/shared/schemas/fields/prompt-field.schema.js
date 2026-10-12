import { GENERATION_PROMPT_MAX_LENGTH } from '#src/modules/generations/generation.constants.js';

export const promptFieldSchema = {
  type: 'string',
  minLength: 1,
  maxLength: GENERATION_PROMPT_MAX_LENGTH,
  pattern: '\\S',
};
