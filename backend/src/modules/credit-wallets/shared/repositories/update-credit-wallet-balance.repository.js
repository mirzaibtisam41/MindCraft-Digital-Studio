import { eq } from 'drizzle-orm';
import { creditWallets } from '#src/modules/credit-wallets/credit-wallet.table.js';

export async function updateCreditWalletBalanceRepository({
  db,
  walletId,
  balance,
}) {
  await db
    .update(creditWallets)
    .set({ balance })
    .where(eq(creditWallets.id, walletId));
}
