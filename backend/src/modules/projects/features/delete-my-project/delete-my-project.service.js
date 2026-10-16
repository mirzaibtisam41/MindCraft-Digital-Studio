import { NotFoundError } from '#src/utils/index.js';
import { deleteUserProjectRepository } from '#src/modules/projects/shared/repositories/index.js';

export async function deleteMyProjectService({ db, userId, projectId }) {
  const deleted = await deleteUserProjectRepository({
    db,
    id: projectId,
    userId,
  });

  if (!deleted) {
    throw new NotFoundError('Project not found');
  }
}
