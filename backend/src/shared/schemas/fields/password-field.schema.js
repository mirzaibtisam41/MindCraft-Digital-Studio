import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_PATTERN,
} from '#src/constants/index.js';

export const passwordFieldSchema = {
  type: 'string',
  minLength: PASSWORD_MIN_LENGTH,
  maxLength: PASSWORD_MAX_LENGTH,
  pattern: PASSWORD_PATTERN,
};
