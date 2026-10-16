import {
  PROMPT_CATEGORIES,
  PROMPT_STYLES,
  PROMPT_TEXT_MAX_LENGTH,
  PROMPT_TITLE_MAX_LENGTH,
} from '#src/modules/prompts/prompt.constants.js';

export const promptTitleSchema = {
  type: 'string',
  minLength: 1,
  maxLength: PROMPT_TITLE_MAX_LENGTH,
  pattern: '\\S',
};

export const promptTextSchema = {
  type: 'string',
  minLength: 1,
  maxLength: PROMPT_TEXT_MAX_LENGTH,
  pattern: '\\S',
};

export const promptCategorySchema = {
  type: 'string',
  enum: PROMPT_CATEGORIES,
};

export const promptStyleSchema = {
  type: ['string', 'null'],
  enum: [...PROMPT_STYLES, null],
};
