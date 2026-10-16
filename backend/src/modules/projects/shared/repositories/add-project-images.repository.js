import { projectImages } from '#src/modules/projects/project-image.table.js';

export async function addProjectImagesRepository({
  db,
  projectId,
  imageIds,
  collectionId,
}) {
  const addedRows = await db
    .insert(projectImages)
    .values(
      imageIds.map((imageId) => ({
        projectId,
        imageId,
        collectionId: collectionId ?? null,
      })),
    )
    .onConflictDoNothing()
    .returning({ imageId: projectImages.imageId });

  return addedRows.map((row) => row.imageId);
}
