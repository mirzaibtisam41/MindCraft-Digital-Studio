import { and, eq } from 'drizzle-orm';
import { projects } from '#src/modules/projects/project.table.js';
import { projectImages } from '#src/modules/projects/project-image.table.js';
import { PROJECT_COLUMNS } from '#src/modules/projects/project-columns.constants.js';

export async function findUserProjectByIdRepository({ db, id, userId }) {
  const [project] = await db
    .select({
      ...PROJECT_COLUMNS,
      imageCount: db.$count(
        projectImages,
        eq(projectImages.projectId, projects.id),
      ),
    })
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, userId)))
    .limit(1);

  return project ?? null;
}
