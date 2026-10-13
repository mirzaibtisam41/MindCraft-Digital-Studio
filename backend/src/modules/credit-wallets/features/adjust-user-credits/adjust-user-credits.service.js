import { CREDIT_TRANSACTION_TYPE } from '#src/modules/credit-transactions/credit-transaction.constants.js';
import { applyCreditChangeService } from '#src/modules/credit-transactions/shared/services/index.js';

export function adjustUserCreditsService({ db, userId, data, adminId }) {
  return db.transaction((tx) =>
    applyCreditChangeService({
      tx,
      userId,
      amount: data.amount,
      type:
        data.amount > 0
          ? CREDIT_TRANSACTION_TYPE.ADMIN_CREDIT
          : CREDIT_TRANSACTION_TYPE.ADMIN_DEBIT,
      reason: data.reason.trim(),
      createdBy: adminId,
    }),
  );
}
