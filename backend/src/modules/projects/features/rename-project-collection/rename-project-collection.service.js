import {
  ConflictError,
  NotFoundError,
  isUniqueViolationErrorUtil,
} from '#src/utils/index.js';
import { renameProjectCollectionRepository } from '#src/modules/projects/shared/repositories/index.js';
import { findOwnedProjectService } from '#src/modules/projects/shared/services/index.js';

export async function renameProjectCollectionService({
  db,
  userId,
  projectId,
  collectionId,
  name,
}) {
  await findOwnedProjectService({ db, userId, projectId });

  let collection;

  try {
    collection = await renameProjectCollectionRepository({
      db,
      id: collectionId,
      projectId,
      name: name.trim(),
    });
  } catch (error) {
    if (isUniqueViolationErrorUtil({ error })) {
      throw new ConflictError(
        'This project already has a collection with this name',
      );
    }

    throw error;
  }

  if (!collection) {
    throw new NotFoundError('Collection not found');
  }

  return collection;
}
