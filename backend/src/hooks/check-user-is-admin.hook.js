import { ForbiddenError } from '#src/utils/index.js';
import { ADMIN_ACCESS_REQUIRED_MESSAGE } from '#src/modules/auth/auth.constants.js';
import { USER_ROLE } from '#src/modules/users/user.constants.js';

export async function checkUserIsAdminHook(request) {
  if (request.user?.role !== USER_ROLE.ADMIN) {
    throw new ForbiddenError(ADMIN_ACCESS_REQUIRED_MESSAGE);
  }
}
