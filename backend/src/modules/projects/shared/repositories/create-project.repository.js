import { projects } from '#src/modules/projects/project.table.js';
import { PROJECT_COLUMNS } from '#src/modules/projects/project-columns.constants.js';

export async function createProjectRepository({ db, data }) {
  const [project] = await db
    .insert(projects)
    .values(data)
    .returning(PROJECT_COLUMNS);

  return project;
}
