import { NotFoundError } from '#src/utils/index.js';
import * as creditRepositories from '#src/modules/credits/shared/repositories/index.js';
import * as generationRepositories from '#src/modules/generations/shared/repositories/index.js';

export async function getGenerationController(request, reply) {
  const { id } = request.params;
  const db = request.server.db;

  const generation =
    await generationRepositories.findGenerationForAdminRepository({
      db,
      id,
    });

  if (!generation) {
    throw new NotFoundError('Generation not found');
  }

  const creditTransactions =
    await creditRepositories.listCreditTransactionsByGenerationRepository({
      db,
      generationId: id,
    });

  return reply.success({ data: { ...generation, creditTransactions } });
}
