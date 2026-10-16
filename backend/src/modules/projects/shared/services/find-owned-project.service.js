import { NotFoundError } from '#src/utils/index.js';
import { findUserProjectByIdRepository } from '#src/modules/projects/shared/repositories/index.js';

export async function findOwnedProjectService({ db, userId, projectId }) {
  const project = await findUserProjectByIdRepository({
    db,
    id: projectId,
    userId,
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  return project;
}
