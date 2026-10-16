import { projects } from '#src/modules/projects/project.table.js';
import { projectCollections } from '#src/modules/projects/project-collection.table.js';

export const PROJECT_COLUMNS = {
  id: projects.id,
  name: projects.name,
  description: projects.description,
  coverImageId: projects.coverImageId,
  createdAt: projects.createdAt,
  updatedAt: projects.updatedAt,
};

export const PROJECT_COLLECTION_COLUMNS = {
  id: projectCollections.id,
  name: projectCollections.name,
  createdAt: projectCollections.createdAt,
};
