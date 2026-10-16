import { and, eq, inArray } from 'drizzle-orm';
import { projectImages } from '#src/modules/projects/project-image.table.js';

export async function setProjectImagesCollectionRepository({
  db,
  projectId,
  imageIds,
  collectionId,
}) {
  const movedRows = await db
    .update(projectImages)
    .set({ collectionId })
    .where(
      and(
        eq(projectImages.projectId, projectId),
        inArray(projectImages.imageId, imageIds),
      ),
    )
    .returning({ imageId: projectImages.imageId });

  return movedRows.map((row) => row.imageId);
}
