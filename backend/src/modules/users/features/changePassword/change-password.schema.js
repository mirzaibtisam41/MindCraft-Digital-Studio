import {
  currentPasswordFieldSchema,
  passwordFieldSchema,
} from '#src/shared/index.js';

export const changePasswordBodySchema = {
  type: 'object',
  required: ['currentPassword', 'newPassword'],
  properties: {
    currentPassword: currentPasswordFieldSchema,
    newPassword: passwordFieldSchema,
  },
  additionalProperties: false,
};
