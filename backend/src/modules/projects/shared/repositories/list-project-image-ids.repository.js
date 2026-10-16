import { and, eq, inArray } from 'drizzle-orm';
import { projectImages } from '#src/modules/projects/project-image.table.js';

export async function listProjectImageIdsRepository({
  db,
  projectId,
  imageIds,
}) {
  const rows = await db
    .select({ imageId: projectImages.imageId })
    .from(projectImages)
    .where(
      and(
        eq(projectImages.projectId, projectId),
        inArray(projectImages.imageId, imageIds),
      ),
    );

  return rows.map((row) => row.imageId);
}
