import { USER_EMAIL_MAX_LENGTH } from '#src/modules/users/user.constants.js';

export const emailFieldSchema = {
  type: 'string',
  format: 'email',
  maxLength: USER_EMAIL_MAX_LENGTH,
};
