import {
  currentPasswordFieldSchema,
  emailFieldSchema,
} from '#src/shared/index.js';

export const loginBodySchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: emailFieldSchema,
    password: currentPasswordFieldSchema,
  },
  additionalProperties: false,
};
