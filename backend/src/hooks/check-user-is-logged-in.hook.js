import { ForbiddenError, UnauthorizedError } from '#src/utils/index.js';
import {
  ACCOUNT_SUSPENDED_MESSAGE,
  NOT_LOGGED_IN_MESSAGE,
} from '#src/modules/auth/auth.constants.js';
import { USER_STATUS } from '#src/modules/users/user.constants.js';
import { findLoggedInUserRepository } from '#src/modules/users/shared/repositories/index.js';

export async function checkUserIsLoggedInHook(request) {
  let tokenPayload;

  try {
    tokenPayload = await request.jwtVerify();
  } catch {
    throw new UnauthorizedError(NOT_LOGGED_IN_MESSAGE);
  }

  const user = await findLoggedInUserRepository({
    db: request.server.db,
    userId: tokenPayload.sub,
    familyId: tokenPayload.fid,
  });

  if (!user) {
    throw new UnauthorizedError(NOT_LOGGED_IN_MESSAGE);
  }

  if (user.status === USER_STATUS.SUSPENDED) {
    throw new ForbiddenError(ACCOUNT_SUSPENDED_MESSAGE);
  }

  request.user = user;
  request.sessionFamilyId = tokenPayload.fid;
}
