import { CHAT_MODELS } from '#src/modules/platform-settings/platform-setting.constants.js';

export const updatePlatformSettingsBodySchema = {
  type: 'object',
  minProperties: 1,
  properties: {
    signupCredits: { type: 'integer', minimum: 0, maximum: 10000 },
    visionModel: { type: 'string', enum: CHAT_MODELS },
    visionCredits: { type: 'integer', minimum: 0, maximum: 100 },
    promptModel: { type: 'string', enum: CHAT_MODELS },
  },
  additionalProperties: false,
};
