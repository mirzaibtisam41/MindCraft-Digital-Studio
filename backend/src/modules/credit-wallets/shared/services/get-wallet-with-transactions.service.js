import { NotFoundError } from '#src/utils/index.js';
import { WALLET_NOT_FOUND_MESSAGE } from '#src/modules/credit-wallets/credit-wallet.constants.js';
import { findCreditWalletByUserIdRepository } from '#src/modules/credit-wallets/shared/repositories/index.js';
import { listCreditTransactionsRepository } from '#src/modules/credit-transactions/shared/repositories/index.js';

export async function getWalletWithTransactionsService({
  db,
  userId,
  page,
  limit,
}) {
  const wallet = await findCreditWalletByUserIdRepository({ db, userId });

  if (!wallet) {
    throw new NotFoundError(WALLET_NOT_FOUND_MESSAGE);
  }

  const { transactions, total } = await listCreditTransactionsRepository({
    db,
    walletId: wallet.id,
    limit,
    offset: (page - 1) * limit,
  });

  return {
    balance: wallet.balance,
    transactions,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
