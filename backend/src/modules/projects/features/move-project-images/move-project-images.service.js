import { NotFoundError } from '#src/utils/index.js';
import {
  findProjectCollectionRepository,
  setProjectImagesCollectionRepository,
} from '#src/modules/projects/shared/repositories/index.js';
import { findOwnedProjectService } from '#src/modules/projects/shared/services/index.js';

export async function moveProjectImagesService({
  db,
  userId,
  projectId,
  imageIds,
  collectionId,
}) {
  await findOwnedProjectService({ db, userId, projectId });

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

  return setProjectImagesCollectionRepository({
    db,
    projectId,
    imageIds,
    collectionId,
  });
}
