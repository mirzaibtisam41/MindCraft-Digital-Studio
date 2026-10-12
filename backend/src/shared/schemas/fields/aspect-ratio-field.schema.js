import {
  ASPECT_RATIO_PATTERN,
  USER_SETTING_ASPECT_RATIO_MAX_LENGTH,
} from '#src/modules/user-settings/user-setting.constants.js';

export const aspectRatioFieldSchema = {
  type: 'string',
  maxLength: USER_SETTING_ASPECT_RATIO_MAX_LENGTH,
  pattern: ASPECT_RATIO_PATTERN,
};
