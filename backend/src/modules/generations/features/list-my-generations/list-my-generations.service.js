import { listUserGenerationsRepository } from '#src/modules/generations/shared/repositories/index.js';
import { presentGenerationsService } from '#src/modules/generations/shared/services/index.js';

export async function listMyGenerationsService({ db, storage, userId, query }) {
  const { page, limit } = query;

  const { generations, total } = await listUserGenerationsRepository({
    db,
    userId,
    limit,
    offset: (page - 1) * limit,
  });

  return {
    generations: await presentGenerationsService({ db, storage, generations }),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
