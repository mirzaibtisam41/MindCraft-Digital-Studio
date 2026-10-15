import {
  WALLET_TRANSACTIONS_DEFAULT_LIMIT,
  WALLET_TRANSACTIONS_MAX_LIMIT,
} from '#src/modules/credit-wallets/credit-wallet.constants.js';

export const walletTransactionsQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: {
      type: 'integer',
      minimum: 1,
      maximum: WALLET_TRANSACTIONS_MAX_LIMIT,
      default: WALLET_TRANSACTIONS_DEFAULT_LIMIT,
    },
  },
  additionalProperties: false,
};
