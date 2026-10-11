import { emailFieldSchema } from '#src/shared/index.js';

export const forgotPasswordBodySchema = {
  type: 'object',
  required: ['email'],
  properties: { email: emailFieldSchema },
  additionalProperties: false,
};
