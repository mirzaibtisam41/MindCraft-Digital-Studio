import { ForbiddenError } from '#src/utils/index.js';
import { USER_ROLE } from '#src/modules/users/user.constants.js';

const SUPER_ADMIN_REQUIRED_MESSAGE = 'Super admin access required';

export async function requireSuperAdminHook(request) {
  if (request.user?.role !== USER_ROLE.SUPER_ADMIN) {
    throw new ForbiddenError(SUPER_ADMIN_REQUIRED_MESSAGE);
  }
}
