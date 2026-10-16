import {
  foreignKey,
  pgTable,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { projects } from '#src/modules/projects/project.table.js';
import { PROJECT_COLLECTION_NAME_MAX_LENGTH } from '#src/modules/projects/project.constants.js';

export const projectCollections = pgTable(
  'project_collections',
  {
    id: uuid().primaryKey().defaultRandom(),
    projectId: uuid().notNull(),
    name: varchar({ length: PROJECT_COLLECTION_NAME_MAX_LENGTH }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    foreignKey({
      name: 'project_collections_project_fk',
      columns: [table.projectId],
      foreignColumns: [projects.id],
    }).onDelete('cascade'),
    unique('project_collections_project_name_unique').on(
      table.projectId,
      table.name,
    ),
  ],
);
