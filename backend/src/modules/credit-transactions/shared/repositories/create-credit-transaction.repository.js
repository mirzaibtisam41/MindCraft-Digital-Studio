import { creditTransactions } from '#src/modules/credit-transactions/credit-transaction.table.js';
import { CREDIT_TRANSACTION_COLUMNS } from '#src/modules/credit-transactions/credit-transaction-columns.constants.js';

export async function createCreditTransactionRepository({ db, data }) {
  const [transaction] = await db
    .insert(creditTransactions)
    .values(data)
    .returning(CREDIT_TRANSACTION_COLUMNS);

  return transaction;
}
