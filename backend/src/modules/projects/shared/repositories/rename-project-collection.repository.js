import { and, eq } from 'drizzle-orm';
import { projectCollections } from '#src/modules/projects/project-collection.table.js';
import { PROJECT_COLLECTION_COLUMNS } from '#src/modules/projects/project-columns.constants.js';

export async function renameProjectCollectionRepository({
  db,
  id,
  projectId,
  name,
}) {
  const [collection] = await db
    .update(projectCollections)
    .set({ name })
    .where(
      and(
        eq(projectCollections.id, id),
        eq(projectCollections.projectId, projectId),
      ),
    )
    .returning(PROJECT_COLLECTION_COLUMNS);

  return collection ?? null;
}
