import { listAiModelsRepository } from '#src/modules/ai-models/shared/repositories/index.js';

export async function listAiModelsService({ db, query }) {
  const { page, limit } = query;

  const { models, total } = await listAiModelsRepository({
    db,
    filters: {
      search: query.search?.trim(),
      providerId: query.providerId,
      status: query.status,
    },
    limit,
    offset: (page - 1) * limit,
  });

  return {
    models,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
