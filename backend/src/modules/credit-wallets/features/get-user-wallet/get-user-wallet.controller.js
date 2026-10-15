import { getWalletWithTransactionsService } from '#src/modules/credit-wallets/shared/services/index.js';

export async function getUserWalletController(request, reply) {
  const { balance, transactions, meta } =
    await getWalletWithTransactionsService({
      db: request.server.db,
      userId: request.params.userId,
      page: request.query.page,
      limit: request.query.limit,
    });

  return reply.success({ data: { balance, transactions }, meta });
}
