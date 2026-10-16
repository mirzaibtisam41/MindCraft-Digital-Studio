import { and, eq } from 'drizzle-orm';
import { projectCollections } from '#src/modules/projects/project-collection.table.js';
import { PROJECT_COLLECTION_COLUMNS } from '#src/modules/projects/project-columns.constants.js';

export async function findProjectCollectionRepository({ db, id, projectId }) {
  const [collection] = await db
    .select(PROJECT_COLLECTION_COLUMNS)
    .from(projectCollections)
    .where(
      and(
        eq(projectCollections.id, id),
        eq(projectCollections.projectId, projectId),
      ),
    )
    .limit(1);

  return collection ?? null;
}
