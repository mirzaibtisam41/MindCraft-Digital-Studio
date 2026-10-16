import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '#src/modules/auth/auth.constants.js';

export const resetPasswordBodySchema = {
  type: 'object',
  required: ['token', 'newPassword'],
  properties: {
    token: { type: 'string', minLength: 1, maxLength: 200 },
    newPassword: {
      type: 'string',
      minLength: PASSWORD_MIN_LENGTH,
      maxLength: PASSWORD_MAX_LENGTH,
    },
  },
  additionalProperties: false,
};
