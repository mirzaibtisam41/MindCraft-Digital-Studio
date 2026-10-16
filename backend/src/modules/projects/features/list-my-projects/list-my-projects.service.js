import { listUserProjectsRepository } from '#src/modules/projects/shared/repositories/index.js';
import { presentProjectsService } from '#src/modules/projects/shared/services/index.js';

export async function listMyProjectsService({ db, storage, userId, query }) {
  const { page, limit } = query;

  const { projects, total } = await listUserProjectsRepository({
    db,
    userId,
    search: query.search?.trim(),
    limit,
    offset: (page - 1) * limit,
  });

  return {
    projects: await presentProjectsService({ db, storage, projects }),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
