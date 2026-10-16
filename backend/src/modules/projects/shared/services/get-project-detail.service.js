import { listProjectCollectionsRepository } from '#src/modules/projects/shared/repositories/index.js';
import { findOwnedProjectService } from '#src/modules/projects/shared/services/find-owned-project.service.js';
import { presentProjectsService } from '#src/modules/projects/shared/services/present-projects.service.js';

export async function getProjectDetailService({
  db,
  storage,
  userId,
  projectId,
}) {
  const project = await findOwnedProjectService({ db, userId, projectId });
  const collections = await listProjectCollectionsRepository({
    db,
    projectId,
  });
  const [presented] = await presentProjectsService({
    db,
    storage,
    projects: [project],
  });

  return { ...presented, collectionCount: collections.length, collections };
}
