import {
  USER_EMAIL_MAX_LENGTH,
  USER_NAME_MAX_LENGTH,
} from '#src/modules/users/user.constants.js';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '#src/modules/auth/auth.constants.js';

export const registerBodySchema = {
  type: 'object',
  required: ['name', 'email', 'password'],
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: USER_NAME_MAX_LENGTH,
      pattern: '\\S',
    },
    email: {
      type: 'string',
      format: 'email',
      maxLength: USER_EMAIL_MAX_LENGTH,
    },
    password: {
      type: 'string',
      minLength: PASSWORD_MIN_LENGTH,
      maxLength: PASSWORD_MAX_LENGTH,
    },
  },
  additionalProperties: false,
};
