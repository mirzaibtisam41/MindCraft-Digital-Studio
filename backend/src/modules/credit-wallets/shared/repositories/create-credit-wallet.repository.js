import { creditWallets } from '#src/modules/credit-wallets/credit-wallet.table.js';

export async function createCreditWalletRepository({ db, userId }) {
  const [wallet] = await db
    .insert(creditWallets)
    .values({ userId })
    .returning({ id: creditWallets.id, balance: creditWallets.balance });

  return wallet;
}
