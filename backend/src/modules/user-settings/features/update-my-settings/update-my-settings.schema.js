import {
  ASPECT_RATIO_PATTERN,
  THEMES,
  USER_SETTING_ASPECT_RATIO_MAX_LENGTH,
  USER_SETTING_DEFAULT_MODEL_MAX_LENGTH,
} from '#src/modules/user-settings/user-setting.constants.js';

export const updateMySettingsBodySchema = {
  type: 'object',
  minProperties: 1,
  properties: {
    defaultModel: {
      type: ['string', 'null'],
      minLength: 1,
      maxLength: USER_SETTING_DEFAULT_MODEL_MAX_LENGTH,
    },
    defaultAspectRatio: {
      type: 'string',
      maxLength: USER_SETTING_ASPECT_RATIO_MAX_LENGTH,
      pattern: ASPECT_RATIO_PATTERN,
    },
    autoEnhancePrompts: { type: 'boolean' },
    saveOriginalsWithEdits: { type: 'boolean' },
    notifyGenerationComplete: { type: 'boolean' },
    notifyGenerationFailed: { type: 'boolean' },
    notifyLowCredits: { type: 'boolean' },
    notifyProductUpdates: { type: 'boolean' },
    theme: { type: 'string', enum: THEMES },
    reduceMotion: { type: 'boolean' },
  },
  additionalProperties: false,
};
