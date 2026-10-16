import { ConflictError, isUniqueViolationErrorUtil } from '#src/utils/index.js';
import { createProjectCollectionRepository } from '#src/modules/projects/shared/repositories/index.js';
import { findOwnedProjectService } from '#src/modules/projects/shared/services/index.js';

export async function createProjectCollectionService({
  db,
  userId,
  projectId,
  name,
}) {
  await findOwnedProjectService({ db, userId, projectId });

  try {
    const collection = await createProjectCollectionRepository({
      db,
      projectId,
      name: name.trim(),
    });

    return { ...collection, imageCount: 0 };
  } catch (error) {
    if (isUniqueViolationErrorUtil({ error })) {
      throw new ConflictError(
        'This project already has a collection with this name',
      );
    }

    throw error;
  }
}
