import { USER_STATUSES } from '#src/modules/users/user.constants.js';

export const updateUserStatusBodySchema = {
  type: 'object',
  required: ['status'],
  properties: {
    status: { type: 'string', enum: USER_STATUSES },
  },
  additionalProperties: false,
};
