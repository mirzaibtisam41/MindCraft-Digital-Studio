import { NotFoundError } from '#src/utils/index.js';
import * as creditRepositories from '#src/modules/credits/shared/repositories/index.js';
import * as userRepositories from '#src/modules/users/shared/repositories/index.js';
import {
  buildPageMetaUtil,
  buildPaginationUtil,
} from '#src/modules/admin/shared/utils/index.js';

export async function listUserCreditTransactionsController(request, reply) {
  const { id } = request.params;
  const { page, pageSize } = request.query;
  const db = request.server.db;

  const user = await userRepositories.findUserByIdRepository({ db, id });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const { items, total } =
    await creditRepositories.listCreditTransactionsByUserRepository({
      db,
      userId: id,
      ...buildPaginationUtil({ page, pageSize }),
    });

  return reply.success({
    data: items,
    meta: buildPageMetaUtil({ page, pageSize, total }),
  });
}
