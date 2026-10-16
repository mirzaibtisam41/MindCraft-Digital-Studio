import { NotFoundError } from '#src/utils/index.js';
import { listUserImageIdsRepository } from '#src/modules/images/shared/repositories/index.js';
import {
  addProjectImagesRepository,
  findProjectCollectionRepository,
  updateUserProjectRepository,
} from '#src/modules/projects/shared/repositories/index.js';
import { findOwnedProjectService } from '#src/modules/projects/shared/services/index.js';

export async function addProjectImagesService({
  db,
  userId,
  projectId,
  imageIds,
  collectionId,
}) {
  await findOwnedProjectService({ db, userId, projectId });

  const ownedIds = await listUserImageIdsRepository({
    db,
    userId,
    ids: imageIds,
  });

  if (ownedIds.length !== imageIds.length) {
    throw new NotFoundError('Some of these images were not found');
  }

  if (collectionId) {
    const collection = await findProjectCollectionRepository({
      db,
      id: collectionId,
      projectId,
    });

    if (!collection) {
      throw new NotFoundError('Collection not found');
    }
  }

  return db.transaction(async (tx) => {
    const addedIds = await addProjectImagesRepository({
      db: tx,
      projectId,
      imageIds,
      collectionId,
    });

    await updateUserProjectRepository({
      db: tx,
      id: projectId,
      userId,
      data: {},
    });

    return addedIds;
  });
}
