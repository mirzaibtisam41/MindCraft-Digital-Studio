import { getWalletWithTransactionsService } from '#src/modules/credit-transactions/shared/services/index.js';

export async function getMyWalletController(request, reply) {
  const { balance, transactions, meta } =
    await getWalletWithTransactionsService({
      db: request.server.db,
      userId: request.user.id,
      page: request.query.page,
      limit: request.query.limit,
    });

  return reply.success({ data: { balance, transactions }, meta });
}
