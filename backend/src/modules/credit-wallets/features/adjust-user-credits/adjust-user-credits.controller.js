import { StatusCodes } from 'http-status-codes';
import { adjustUserCreditsService } from '#src/modules/credit-wallets/features/adjust-user-credits/adjust-user-credits.service.js';

export async function adjustUserCreditsController(request, reply) {
  const { transaction, balance } = await adjustUserCreditsService({
    db: request.server.db,
    userId: request.params.userId,
    data: request.body,
    adminId: request.user.id,
  });

  return reply.success({
    data: { transaction, balance },
    message: transaction.amount > 0 ? 'Credits added' : 'Credits deducted',
    statusCode: StatusCodes.CREATED,
  });
}
