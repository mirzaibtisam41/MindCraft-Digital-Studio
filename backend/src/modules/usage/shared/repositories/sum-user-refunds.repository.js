import { and, eq, inArray, sql } from 'drizzle-orm';
import { creditTransactions } from '#src/modules/credit-transactions/credit-transaction.table.js';
import { CREDIT_TRANSACTION_TYPE } from '#src/modules/credit-transactions/credit-transaction.constants.js';
import { creditWallets } from '#src/modules/credit-wallets/credit-wallet.table.js';
import { isInLocalRangeSqlUtil } from '#src/modules/usage/shared/utils/index.js';

export async function sumUserRefundsRepository({ db, userId, range }) {
  const [row] = await db
    .select({
      credits: sql`coalesce(sum(${creditTransactions.amount}), 0)::int`,
      refunds: sql`count(*)::int`,
    })
    .from(creditTransactions)
    .innerJoin(creditWallets, eq(creditWallets.id, creditTransactions.walletId))
    .where(
      and(
        eq(creditWallets.userId, userId),
        inArray(creditTransactions.type, [
          CREDIT_TRANSACTION_TYPE.GENERATION_REFUND,
          CREDIT_TRANSACTION_TYPE.ANALYSIS_REFUND,
        ]),
        isInLocalRangeSqlUtil({ column: creditTransactions.createdAt, range }),
      ),
    );

  return row;
}
