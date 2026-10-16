import { BadRequestError } from '#src/utils/index.js';
import {
  listProjectImageIdsRepository,
  updateUserProjectRepository,
} from '#src/modules/projects/shared/repositories/index.js';
import {
  findOwnedProjectService,
  getProjectDetailService,
} from '#src/modules/projects/shared/services/index.js';

async function checkImageIsInProject({ db, projectId, imageId }) {
  const found = await listProjectImageIdsRepository({
    db,
    projectId,
    imageIds: [imageId],
  });

  if (found.length === 0) {
    throw new BadRequestError('The cover must be an image in this project');
  }
}

export async function updateMyProjectService({
  db,
  storage,
  userId,
  projectId,
  data,
}) {
  await findOwnedProjectService({ db, userId, projectId });

  if (data.coverImageId) {
    await checkImageIsInProject({ db, projectId, imageId: data.coverImageId });
  }

  const changes = {};

  if (data.name !== undefined) changes.name = data.name.trim();
  if (data.description !== undefined) {
    changes.description = data.description?.trim() || null;
  }
  if (data.coverImageId !== undefined) changes.coverImageId = data.coverImageId;

  await updateUserProjectRepository({
    db,
    id: projectId,
    userId,
    data: changes,
  });

  return getProjectDetailService({ db, storage, userId, projectId });
}
