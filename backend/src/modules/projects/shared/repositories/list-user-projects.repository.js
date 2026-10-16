import { and, count, desc, eq, ilike } from 'drizzle-orm';
import { escapeLikePatternUtil } from '#src/utils/index.js';
import { projects } from '#src/modules/projects/project.table.js';
import { projectImages } from '#src/modules/projects/project-image.table.js';
import { projectCollections } from '#src/modules/projects/project-collection.table.js';
import { PROJECT_COLUMNS } from '#src/modules/projects/project-columns.constants.js';

export async function listUserProjectsRepository({
  db,
  userId,
  search,
  limit,
  offset,
}) {
  const where = and(
    eq(projects.userId, userId),
    search
      ? ilike(projects.name, `%${escapeLikePatternUtil({ text: search })}%`)
      : undefined,
  );

  const projectList = await db
    .select({
      ...PROJECT_COLUMNS,
      imageCount: db.$count(
        projectImages,
        eq(projectImages.projectId, projects.id),
      ),
      collectionCount: db.$count(
        projectCollections,
        eq(projectCollections.projectId, projects.id),
      ),
    })
    .from(projects)
    .where(where)
    .orderBy(desc(projects.updatedAt), desc(projects.id))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(projects)
    .where(where);

  return { projects: projectList, total };
}
