import { ForbiddenError, NotFoundError } from '#src/utils/index.js';
import { CANNOT_MODIFY_SELF_MESSAGE } from '#src/modules/admin/admin.constants.js';
import {
  AUDIT_ACTION,
  AUDIT_TARGET_TYPE,
} from '#src/modules/audit-logs/audit-log.constants.js';
import { recordAuditLogService } from '#src/modules/audit-logs/shared/services/index.js';
import * as sessionRepositories from '#src/modules/sessions/shared/repositories/index.js';
import * as userRepositories from '#src/modules/users/shared/repositories/index.js';

async function applySuspension({ db, actorId, current, suspended }) {
  const isSuspended = Boolean(current.suspendedAt);

  if (suspended === isSuspended) return null;

  if (suspended) {
    await sessionRepositories.revokeUserSessionsRepository({
      db,
      userId: current.id,
    });
  }

  await recordAuditLogService({
    db,
    actorId,
    action: suspended
      ? AUDIT_ACTION.USER_SUSPENDED
      : AUDIT_ACTION.USER_UNSUSPENDED,
    targetType: AUDIT_TARGET_TYPE.USER,
    targetId: current.id,
  });

  return { suspendedAt: suspended ? new Date() : null };
}

async function applyRole({ db, actorId, current, role }) {
  if (role === current.role) return null;

  await recordAuditLogService({
    db,
    actorId,
    action: AUDIT_ACTION.USER_ROLE_CHANGED,
    targetType: AUDIT_TARGET_TYPE.USER,
    targetId: current.id,
    changes: { role: { from: current.role, to: role } },
  });

  return { role };
}

export async function updateUserService({ db, actorId, id, input }) {
  if (id === actorId) {
    throw new ForbiddenError(CANNOT_MODIFY_SELF_MESSAGE);
  }

  return db.transaction(async (tx) => {
    const current = await userRepositories.findUserForAdminRepository({
      db: tx,
      id,
    });

    if (!current) {
      throw new NotFoundError('User not found');
    }

    const data = {};

    if (input.suspended !== undefined) {
      Object.assign(
        data,
        await applySuspension({
          db: tx,
          actorId,
          current,
          suspended: input.suspended,
        }),
      );
    }

    if (input.role !== undefined) {
      Object.assign(
        data,
        await applyRole({ db: tx, actorId, current, role: input.role }),
      );
    }

    if (Object.keys(data).length === 0) {
      return current;
    }

    return userRepositories.updateUserForAdminRepository({
      db: tx,
      id,
      data,
    });
  });
}
