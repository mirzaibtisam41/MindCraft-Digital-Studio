import { BadRequestError, NotFoundError } from '#src/utils/index.js';
import {
  findCreditWalletByUserIdRepository,
  updateCreditWalletBalanceRepository,
} from '#src/modules/credit-wallets/shared/repositories/index.js';
import {
  createCreditTransactionRepository,
  findCreditTransactionByIdempotencyKeyRepository,
} from '#src/modules/credit-transactions/shared/repositories/index.js';
import { notifyIfCreditsRanLowService } from '#src/modules/notifications/shared/services/index.js';

export async function applyCreditChangeService({
  db,
  userId,
  amount,
  type,
  reason = null,
  createdBy = null,
  idempotencyKey = null,
}) {
  const wallet = await findCreditWalletByUserIdRepository({
    db,
    userId,
    lockForUpdate: true,
  });

  if (!wallet) {
    throw new NotFoundError('User wallet not found');
  }

  if (idempotencyKey) {
    const existingTransaction =
      await findCreditTransactionByIdempotencyKeyRepository({
        db,
        idempotencyKey,
      });

    if (existingTransaction) {
      return { transaction: existingTransaction, balance: wallet.balance };
    }
  }

  const balanceAfter = wallet.balance + amount;

  if (balanceAfter < 0) {
    throw new BadRequestError('Not enough credits for this change');
  }

  await updateCreditWalletBalanceRepository({
    db,
    walletId: wallet.id,
    balance: balanceAfter,
  });

  const transaction = await createCreditTransactionRepository({
    db,
    data: {
      walletId: wallet.id,
      amount,
      balanceAfter,
      type,
      reason,
      createdBy,
      idempotencyKey,
    },
  });

  if (amount < 0) {
    await notifyIfCreditsRanLowService({
      db,
      userId,
      balanceBefore: wallet.balance,
      balanceAfter,
    });
  }

  return { transaction, balance: balanceAfter };
}
