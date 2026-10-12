import { desc, eq, sql } from 'drizzle-orm';
import { creditTransactions } from '#src/modules/credits/credit-transaction.table.js';

const TRANSACTION_COLUMNS = {
  id: creditTransactions.id,
  amount: creditTransactions.amount,
  type: creditTransactions.type,
  note: creditTransactions.note,
  generationId: creditTransactions.generationId,
  createdAt: creditTransactions.createdAt,
};

export async function listCreditTransactionsByUserRepository({
  db,
  userId,
  limit,
  offset,
}) {
  const items = await db
    .select(TRANSACTION_COLUMNS)
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, userId))
    .orderBy(desc(creditTransactions.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: sql`count(*)::int` })
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, userId));

  return { items, total };
}

export async function listCreditTransactionsByGenerationRepository({
  db,
  generationId,
}) {
  return db
    .select(TRANSACTION_COLUMNS)
    .from(creditTransactions)
    .where(eq(creditTransactions.generationId, generationId))
    .orderBy(desc(creditTransactions.createdAt));
}
