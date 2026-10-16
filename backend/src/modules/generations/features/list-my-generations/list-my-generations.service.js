import { GENERATION_STATUSES } from '#src/modules/generations/generation.constants.js';
import { listUserGenerationsRepository } from '#src/modules/generations/shared/repositories/index.js';
import { presentGenerationsService } from '#src/modules/generations/shared/services/index.js';

export async function listMyGenerationsService({ db, storage, userId, query }) {
  const { page, limit } = query;

  const { generations, total, statusRows } =
    await listUserGenerationsRepository({
      db,
      filters: {
        userId,
        status: query.status,
        modelId: query.modelId,
        search: query.search?.trim(),
      },
      limit,
      offset: (page - 1) * limit,
    });

  const statusCounts = Object.fromEntries(
    GENERATION_STATUSES.map((status) => [
      status,
      statusRows.find((row) => row.status === status)?.total ?? 0,
    ]),
  );

  return {
    generations: await presentGenerationsService({ db, storage, generations }),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      statusCounts: {
        all: Object.values(statusCounts).reduce((sum, value) => sum + value, 0),
        ...statusCounts,
      },
    },
  };
}
