export const verifyEmailBodySchema = {
  type: 'object',
  required: ['token'],
  properties: {
    token: { type: 'string', minLength: 1, maxLength: 200 },
  },
  additionalProperties: false,
};
