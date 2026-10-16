import { createProjectRepository } from '#src/modules/projects/shared/repositories/index.js';

export async function createProjectService({ db, userId, data }) {
  const project = await createProjectRepository({
    db,
    data: {
      userId,
      name: data.name.trim(),
      description: data.description?.trim() || null,
    },
  });

  return { ...project, imageCount: 0, collectionCount: 0, previewImages: [] };
}
