import {
  CREDIT_TRANSACTIONS_DEFAULT_LIMIT,
  CREDIT_TRANSACTIONS_MAX_LIMIT,
} from '#src/modules/credit-transactions/credit-transaction.constants.js';

export const walletTransactionsQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: {
      type: 'integer',
      minimum: 1,
      maximum: CREDIT_TRANSACTIONS_MAX_LIMIT,
      default: CREDIT_TRANSACTIONS_DEFAULT_LIMIT,
    },
  },
  additionalProperties: false,
};

export const userIdParamsSchema = {
  type: 'object',
  required: ['userId'],
  properties: {
    userId: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};
