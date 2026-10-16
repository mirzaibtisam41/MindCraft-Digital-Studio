import { and, eq } from 'drizzle-orm';
import { projects } from '#src/modules/projects/project.table.js';
import { PROJECT_COLUMNS } from '#src/modules/projects/project-columns.constants.js';

export async function updateUserProjectRepository({ db, id, userId, data }) {
  const [project] = await db
    .update(projects)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(projects.id, id), eq(projects.userId, userId)))
    .returning(PROJECT_COLUMNS);

  return project ?? null;
}
