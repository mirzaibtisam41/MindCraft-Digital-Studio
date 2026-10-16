import { and, eq } from 'drizzle-orm';
import { projectCollections } from '#src/modules/projects/project-collection.table.js';

export async function deleteProjectCollectionRepository({ db, id, projectId }) {
  const [collection] = await db
    .delete(projectCollections)
    .where(
      and(
        eq(projectCollections.id, id),
        eq(projectCollections.projectId, projectId),
      ),
    )
    .returning({ id: projectCollections.id });

  return collection ?? null;
}
