import { projectCollections } from '#src/modules/projects/project-collection.table.js';
import { PROJECT_COLLECTION_COLUMNS } from '#src/modules/projects/project-columns.constants.js';

export async function createProjectCollectionRepository({
  db,
  projectId,
  name,
}) {
  const [collection] = await db
    .insert(projectCollections)
    .values({ projectId, name })
    .returning(PROJECT_COLLECTION_COLUMNS);

  return collection;
}
