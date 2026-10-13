import {
  checkUserIsAdminHook,
  checkUserIsLoggedInHook,
} from '#src/hooks/index.js';
import {
  userIdParamsSchema,
  walletTransactionsQuerySchema,
} from './credit-wallet-request.schema.js';
import { adjustUserCreditsController } from './features/adjust-user-credits/adjust-user-credits.controller.js';
import { adjustUserCreditsBodySchema } from './features/adjust-user-credits/adjust-user-credits.schema.js';
import { getMyWalletController } from './features/get-my-wallet/get-my-wallet.controller.js';
import { getUserWalletController } from './features/get-user-wallet/get-user-wallet.controller.js';

export function myWalletRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);

  fastify.get(
    '/',
    { schema: { querystring: walletTransactionsQuerySchema } },
    getMyWalletController,
  );
}

export function adminUserWalletRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);
  fastify.addHook('onRequest', checkUserIsAdminHook);

  fastify.get(
    '/:userId/wallet',
    {
      schema: {
        params: userIdParamsSchema,
        querystring: walletTransactionsQuerySchema,
      },
    },
    getUserWalletController,
  );

  fastify.post(
    '/:userId/credit-adjustments',
    {
      schema: { params: userIdParamsSchema, body: adjustUserCreditsBodySchema },
    },
    adjustUserCreditsController,
  );
}
