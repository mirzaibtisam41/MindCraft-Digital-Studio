import { eq } from 'drizzle-orm';
import { creditTransactions } from '#src/modules/credit-transactions/credit-transaction.table.js';
import { CREDIT_TRANSACTION_COLUMNS } from '#src/modules/credit-transactions/credit-transaction-columns.constants.js';

export async function findCreditTransactionByIdempotencyKeyRepository({
  db,
  idempotencyKey,
}) {
  const [transaction] = await db
    .select(CREDIT_TRANSACTION_COLUMNS)
    .from(creditTransactions)
    .where(eq(creditTransactions.idempotencyKey, idempotencyKey))
    .limit(1);

  return transaction ?? null;
}
