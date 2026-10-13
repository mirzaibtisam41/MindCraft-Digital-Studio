import { SIGNUP_CREDITS_MAX } from '#src/modules/platform-settings/platform-setting.constants.js';

export const updatePlatformSettingsBodySchema = {
  type: 'object',
  required: ['signupCredits'],
  properties: {
    signupCredits: { type: 'integer', minimum: 0, maximum: SIGNUP_CREDITS_MAX },
  },
  additionalProperties: false,
};
