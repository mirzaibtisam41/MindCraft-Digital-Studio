import { desc, eq, inArray } from 'drizzle-orm';
import { images } from '#src/modules/images/image.table.js';
import { projectImages } from '#src/modules/projects/project-image.table.js';

export function listProjectPreviewImagesRepository({ db, projectIds }) {
  return db
    .select({
      projectId: projectImages.projectId,
      id: images.id,
      storageKey: images.storageKey,
      thumbnailKey: images.thumbnailKey,
    })
    .from(projectImages)
    .innerJoin(images, eq(images.id, projectImages.imageId))
    .where(inArray(projectImages.projectId, projectIds))
    .orderBy(desc(projectImages.addedAt));
}
