import { passwordFieldSchema } from '#src/shared/index.js';

const RESET_TOKEN_MIN_LENGTH = 20;
const RESET_TOKEN_MAX_LENGTH = 200;

export const resetPasswordBodySchema = {
  type: 'object',
  required: ['token', 'password'],
  properties: {
    token: {
      type: 'string',
      minLength: RESET_TOKEN_MIN_LENGTH,
      maxLength: RESET_TOKEN_MAX_LENGTH,
    },
    password: passwordFieldSchema,
  },
  additionalProperties: false,
};
