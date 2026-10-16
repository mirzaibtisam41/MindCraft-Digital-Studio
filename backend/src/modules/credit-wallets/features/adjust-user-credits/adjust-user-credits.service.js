import { CREDIT_TRANSACTION_TYPE } from '#src/modules/credit-transactions/credit-transaction.constants.js';
import { applyCreditChangeService } from '#src/modules/credit-wallets/shared/services/index.js';
import { NOTIFICATION_TYPE } from '#src/modules/notifications/notification.constants.js';
import { createNotificationService } from '#src/modules/notifications/shared/services/index.js';

export function adjustUserCreditsService({ db, userId, data, adminId }) {
  const isCredit = data.amount > 0;
  const credits = Math.abs(data.amount);
  const reason = data.reason.trim();

  return db.transaction(async (tx) => {
    const result = await applyCreditChangeService({
      db: tx,
      userId,
      amount: data.amount,
      type: isCredit
        ? CREDIT_TRANSACTION_TYPE.ADMIN_CREDIT
        : CREDIT_TRANSACTION_TYPE.ADMIN_DEBIT,
      reason,
      createdBy: adminId,
    });

    await createNotificationService({
      db: tx,
      userId,
      type: isCredit
        ? NOTIFICATION_TYPE.CREDITS_ADDED
        : NOTIFICATION_TYPE.CREDITS_REMOVED,
      title: `${credits} ${credits === 1 ? 'credit' : 'credits'} ${isCredit ? 'added to' : 'removed from'} your balance`,
      body: reason,
      link: '/app/credits',
    });

    return result;
  });
}
