import { eq } from 'drizzle-orm';
import { creditWallets } from '#src/modules/credit-wallets/credit-wallet.table.js';

export async function findCreditWalletByUserIdRepository({
  db,
  userId,
  lockForUpdate = false,
}) {
  const query = db
    .select({
      id: creditWallets.id,
      userId: creditWallets.userId,
      balance: creditWallets.balance,
      updatedAt: creditWallets.updatedAt,
    })
    .from(creditWallets)
    .where(eq(creditWallets.userId, userId))
    .limit(1);

  const [wallet] = lockForUpdate ? await query.for('update') : await query;

  return wallet ?? null;
}
