import { USER_EMAIL_MAX_LENGTH } from '#src/modules/users/user.constants.js';
import { PASSWORD_MAX_LENGTH } from '#src/modules/auth/auth.constants.js';

export const loginBodySchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
      maxLength: USER_EMAIL_MAX_LENGTH,
    },
    password: {
      type: 'string',
      minLength: 1,
      maxLength: PASSWORD_MAX_LENGTH,
    },
  },
  additionalProperties: false,
};
