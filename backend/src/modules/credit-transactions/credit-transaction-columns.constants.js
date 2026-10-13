import { creditTransactions } from '#src/modules/credit-transactions/credit-transaction.table.js';

export const CREDIT_TRANSACTION_COLUMNS = {
  id: creditTransactions.id,
  amount: creditTransactions.amount,
  balanceAfter: creditTransactions.balanceAfter,
  type: creditTransactions.type,
  reason: creditTransactions.reason,
  createdBy: creditTransactions.createdBy,
  createdAt: creditTransactions.createdAt,
};
