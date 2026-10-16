import { and, eq, inArray } from 'drizzle-orm';
import { projectImages } from '#src/modules/projects/project-image.table.js';

export async function removeProjectImagesRepository({
  db,
  projectId,
  imageIds,
}) {
  const removedRows = await db
    .delete(projectImages)
    .where(
      and(
        eq(projectImages.projectId, projectId),
        inArray(projectImages.imageId, imageIds),
      ),
    )
    .returning({ imageId: projectImages.imageId });

  return removedRows.map((row) => row.imageId);
}
