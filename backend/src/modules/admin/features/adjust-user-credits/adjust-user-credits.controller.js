import { StatusCodes } from 'http-status-codes';
import { adjustUserCreditsService } from './adjust-user-credits.service.js';

export async function adjustUserCreditsController(request, reply) {
  const result = await adjustUserCreditsService({
    db: request.server.db,
    actorId: request.user.id,
    userId: request.params.id,
    amount: request.body.amount,
    reason: request.body.reason,
  });

  return reply.success({
    data: result,
    message: 'Credits adjusted',
    statusCode: StatusCodes.CREATED,
  });
}
