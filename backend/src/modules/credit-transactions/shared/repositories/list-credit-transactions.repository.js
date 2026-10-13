import { count, desc, eq } from 'drizzle-orm';
import { creditTransactions } from '#src/modules/credit-transactions/credit-transaction.table.js';
import { CREDIT_TRANSACTION_COLUMNS } from '#src/modules/credit-transactions/credit-transaction-columns.constants.js';

export async function listCreditTransactionsRepository({
  db,
  walletId,
  limit,
  offset,
}) {
  const where = eq(creditTransactions.walletId, walletId);

  const transactions = await db
    .select(CREDIT_TRANSACTION_COLUMNS)
    .from(creditTransactions)
    .where(where)
    .orderBy(desc(creditTransactions.createdAt), desc(creditTransactions.id))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(creditTransactions)
    .where(where);

  return { transactions, total };
}
