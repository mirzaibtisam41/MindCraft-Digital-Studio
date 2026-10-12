import { creditTransactions } from '#src/modules/credits/credit-transaction.table.js';

export async function insertCreditTransactionRepository({ db, data }) {
  const [transaction] = await db
    .insert(creditTransactions)
    .values(data)
    .onConflictDoNothing({ target: creditTransactions.idempotencyKey })
    .returning();

  return transaction ?? null;
}
