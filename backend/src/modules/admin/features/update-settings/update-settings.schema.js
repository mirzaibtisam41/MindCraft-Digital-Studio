import {
  SIGNUP_CREDITS_MAX,
  SIGNUP_CREDITS_MIN,
} from '#src/modules/system-settings/system-setting.constants.js';

export const updateSettingsBodySchema = {
  type: 'object',
  minProperties: 1,
  properties: {
    signupCredits: {
      type: 'integer',
      minimum: SIGNUP_CREDITS_MIN,
      maximum: SIGNUP_CREDITS_MAX,
    },
  },
  additionalProperties: false,
};
