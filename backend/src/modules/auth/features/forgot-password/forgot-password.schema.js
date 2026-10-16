import { USER_EMAIL_MAX_LENGTH } from '#src/modules/users/user.constants.js';

export const forgotPasswordBodySchema = {
  type: 'object',
  required: ['email'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
      maxLength: USER_EMAIL_MAX_LENGTH,
    },
  },
  additionalProperties: false,
};
