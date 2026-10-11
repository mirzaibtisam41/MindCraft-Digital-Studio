import { USER_NAME_MAX_LENGTH } from '#src/modules/users/user.constants.js';

export const nameFieldSchema = {
  type: 'string',
  minLength: 1,
  maxLength: USER_NAME_MAX_LENGTH,
  pattern: '\\S',
};
