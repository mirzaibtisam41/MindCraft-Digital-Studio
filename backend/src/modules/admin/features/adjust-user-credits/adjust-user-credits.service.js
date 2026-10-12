import { randomUUID } from 'node:crypto';
import { BadRequestError, NotFoundError } from '#src/utils/index.js';
import { NEGATIVE_BALANCE_MESSAGE } from '#src/modules/admin/admin.constants.js';
import {
  AUDIT_ACTION,
  AUDIT_TARGET_TYPE,
} from '#src/modules/audit-logs/audit-log.constants.js';
import { recordAuditLogService } from '#src/modules/audit-logs/shared/services/index.js';
import { CREDIT_TRANSACTION_TYPE } from '#src/modules/credits/credit.constants.js';
import * as creditRepositories from '#src/modules/credits/shared/repositories/index.js';
import * as userRepositories from '#src/modules/users/shared/repositories/index.js';

async function applyAmount({ db, userId, amount }) {
  if (amount > 0) {
    return creditRepositories.addUserCreditsRepository({ db, userId, amount });
  }

  const user = await creditRepositories.deductUserCreditsRepository({
    db,
    userId,
    amount: -amount,
  });

  if (!user) {
    throw new BadRequestError(NEGATIVE_BALANCE_MESSAGE);
  }

  return user;
}

export async function adjustUserCreditsService({
  db,
  actorId,
  userId,
  amount,
  reason,
}) {
  return db.transaction(async (tx) => {
    const target = await userRepositories.findUserByIdRepository({
      db: tx,
      id: userId,
    });

    if (!target) {
      throw new NotFoundError('User not found');
    }

    const note = reason.trim();

    const transaction =
      await creditRepositories.insertCreditTransactionRepository({
        db: tx,
        data: {
          userId,
          amount,
          type: CREDIT_TRANSACTION_TYPE.ADMIN_ADJUSTMENT,
          note,
          idempotencyKey: `admin:${randomUUID()}`,
        },
      });

    const { creditBalance } = await applyAmount({ db: tx, userId, amount });

    await recordAuditLogService({
      db: tx,
      actorId,
      action: AUDIT_ACTION.CREDITS_ADJUSTED,
      targetType: AUDIT_TARGET_TYPE.USER,
      targetId: userId,
      changes: {
        amount,
        reason: note,
        balance: { from: target.creditBalance, to: creditBalance },
      },
    });

    return { transaction, creditBalance };
  });
}
