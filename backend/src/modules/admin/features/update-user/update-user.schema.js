import { USER_ROLES } from '#src/modules/users/user.constants.js';

export const updateUserBodySchema = {
  type: 'object',
  minProperties: 1,
  properties: {
    role: { type: 'string', enum: USER_ROLES },
    suspended: { type: 'boolean' },
  },
  additionalProperties: false,
};
