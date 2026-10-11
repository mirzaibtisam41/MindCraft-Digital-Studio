import {
  emailFieldSchema,
  nameFieldSchema,
  passwordFieldSchema,
} from '#src/shared/index.js';

export const registerBodySchema = {
  type: 'object',
  required: ['name', 'email', 'password'],
  properties: {
    name: nameFieldSchema,
    email: emailFieldSchema,
    password: passwordFieldSchema,
  },
  additionalProperties: false,
};
