import { NotFoundError } from '#src/utils/index.js';
import { deleteProjectCollectionRepository } from '#src/modules/projects/shared/repositories/index.js';
import { findOwnedProjectService } from '#src/modules/projects/shared/services/index.js';

export async function deleteProjectCollectionService({
  db,
  userId,
  projectId,
  collectionId,
}) {
  await findOwnedProjectService({ db, userId, projectId });

  const deleted = await deleteProjectCollectionRepository({
    db,
    id: collectionId,
    projectId,
  });

  if (!deleted) {
    throw new NotFoundError('Collection not found');
  }
}
