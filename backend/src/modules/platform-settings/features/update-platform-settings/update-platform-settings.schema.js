export const updatePlatformSettingsBodySchema = {
  type: 'object',
  required: ['signupCredits'],
  properties: {
    signupCredits: { type: 'integer', minimum: 0, maximum: 10000 },
  },
  additionalProperties: false,
};
