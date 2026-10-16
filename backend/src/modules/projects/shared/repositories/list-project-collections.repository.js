import { asc, eq } from 'drizzle-orm';
import { projectCollections } from '#src/modules/projects/project-collection.table.js';
import { projectImages } from '#src/modules/projects/project-image.table.js';
import { PROJECT_COLLECTION_COLUMNS } from '#src/modules/projects/project-columns.constants.js';

export function listProjectCollectionsRepository({ db, projectId }) {
  return db
    .select({
      ...PROJECT_COLLECTION_COLUMNS,
      imageCount: db.$count(
        projectImages,
        eq(projectImages.collectionId, projectCollections.id),
      ),
    })
    .from(projectCollections)
    .where(eq(projectCollections.projectId, projectId))
    .orderBy(asc(projectCollections.createdAt), asc(projectCollections.name));
}
