import {
  OVERVIEW_RANGE_DEFAULT,
  OVERVIEW_RANGES,
  OVERVIEW_TIMEZONE_DEFAULT,
  OVERVIEW_TIMEZONE_MAX_LENGTH,
} from '#src/modules/admin/admin.constants.js';

export const getOverviewQuerySchema = {
  type: 'object',
  properties: {
    range: {
      type: 'string',
      enum: OVERVIEW_RANGES,
      default: OVERVIEW_RANGE_DEFAULT,
    },
    timezone: {
      type: 'string',
      minLength: 1,
      maxLength: OVERVIEW_TIMEZONE_MAX_LENGTH,
      default: OVERVIEW_TIMEZONE_DEFAULT,
    },
  },
  additionalProperties: false,
};
