import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '#src/modules/auth/auth.constants.js';

export const changeMyPasswordBodySchema = {
  type: 'object',
  required: ['currentPassword', 'newPassword'],
  properties: {
    currentPassword: {
      type: 'string',
      minLength: 1,
      maxLength: PASSWORD_MAX_LENGTH,
    },
    newPassword: {
      type: 'string',
      minLength: PASSWORD_MIN_LENGTH,
      maxLength: PASSWORD_MAX_LENGTH,
    },
  },
  additionalProperties: false,
};
