export const SYSTEM_SETTING_KEY = {
  SIGNUP_CREDITS: 'signup_credits',
};

export const SYSTEM_SETTING_KEYS = Object.values(SYSTEM_SETTING_KEY);

export const SYSTEM_SETTING_KEY_MAX_LENGTH = 50;

export const SYSTEM_SETTING_DEFAULTS = {
  [SYSTEM_SETTING_KEY.SIGNUP_CREDITS]: 60,
};

export const SIGNUP_CREDITS_MIN = 0;

export const SIGNUP_CREDITS_MAX = 10000;
