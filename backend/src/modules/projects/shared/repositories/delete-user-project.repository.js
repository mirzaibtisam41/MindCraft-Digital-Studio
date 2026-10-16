import { and, eq } from 'drizzle-orm';
import { projects } from '#src/modules/projects/project.table.js';

export async function deleteUserProjectRepository({ db, id, userId }) {
  const [project] = await db
    .delete(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, userId)))
    .returning({ id: projects.id });

  return project ?? null;
}
