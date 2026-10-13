import { BadRequestError, NotFoundError } from '#src/utils/index.js';
import {
  NOT_ENOUGH_CREDITS_MESSAGE,
  WALLET_NOT_FOUND_MESSAGE,
} from '#src/modules/credit-transactions/credit-transaction.constants.js';
import {
  findCreditWalletByUserIdRepository,
  updateCreditWalletBalanceRepository,
} from '#src/modules/credit-wallets/shared/repositories/index.js';
import {
  createCreditTransactionRepository,
  findCreditTransactionByIdempotencyKeyRepository,
} from '#src/modules/credit-transactions/shared/repositories/index.js';

export async function applyCreditChangeService({
  tx,
  userId,
  amount,
  type,
  reason = null,
  createdBy = null,
  idempotencyKey = null,
}) {
  const wallet = await findCreditWalletByUserIdRepository({
    db: tx,
    userId,
    lockForUpdate: true,
  });

  if (!wallet) {
    throw new NotFoundError(WALLET_NOT_FOUND_MESSAGE);
  }

  if (idempotencyKey) {
    const existingTransaction =
      await findCreditTransactionByIdempotencyKeyRepository({
        db: tx,
        idempotencyKey,
      });

    if (existingTransaction) {
      return { transaction: existingTransaction, balance: wallet.balance };
    }
  }

  const balanceAfter = wallet.balance + amount;

  if (balanceAfter < 0) {
    throw new BadRequestError(NOT_ENOUGH_CREDITS_MESSAGE);
  }

  await updateCreditWalletBalanceRepository({
    db: tx,
    walletId: wallet.id,
    balance: balanceAfter,
  });

  const transaction = await createCreditTransactionRepository({
    db: tx,
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

  return { transaction, balance: balanceAfter };
}
