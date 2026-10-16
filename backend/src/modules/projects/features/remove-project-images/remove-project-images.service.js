import {
  removeProjectImagesRepository,
  updateUserProjectRepository,
} from '#src/modules/projects/shared/repositories/index.js';
import { findOwnedProjectService } from '#src/modules/projects/shared/services/index.js';

export async function removeProjectImagesService({
  db,
  userId,
  projectId,
  imageIds,
}) {
  const project = await findOwnedProjectService({ db, userId, projectId });

  return db.transaction(async (tx) => {
    const removedIds = await removeProjectImagesRepository({
      db: tx,
      projectId,
      imageIds,
    });

    await updateUserProjectRepository({
      db: tx,
      id: projectId,
      userId,
      data: removedIds.includes(project.coverImageId)
        ? { coverImageId: null }
        : {},
    });

    return removedIds;
  });
}
