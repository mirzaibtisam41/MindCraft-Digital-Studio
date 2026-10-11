import { PASSWORD_MAX_LENGTH } from '#src/constants/index.js';

export const currentPasswordFieldSchema = {
  type: 'string',
  minLength: 1,
  maxLength: PASSWORD_MAX_LENGTH,
};
