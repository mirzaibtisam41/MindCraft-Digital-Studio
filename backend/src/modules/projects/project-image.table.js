import {
  foreignKey,
  index,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { projects } from '#src/modules/projects/project.table.js';
import { projectCollections } from '#src/modules/projects/project-collection.table.js';
import { images } from '#src/modules/images/image.table.js';

export const projectImages = pgTable(
  'project_images',
  {
    projectId: uuid().notNull(),
    imageId: uuid().notNull(),
    collectionId: uuid(),
    addedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({
      name: 'project_images_pk',
      columns: [table.projectId, table.imageId],
    }),
    foreignKey({
      name: 'project_images_project_fk',
      columns: [table.projectId],
      foreignColumns: [projects.id],
    }).onDelete('cascade'),
    foreignKey({
      name: 'project_images_image_fk',
      columns: [table.imageId],
      foreignColumns: [images.id],
    }).onDelete('cascade'),
    foreignKey({
      name: 'project_images_collection_fk',
      columns: [table.collectionId],
      foreignColumns: [projectCollections.id],
    }).onDelete('set null'),
    index('project_images_image_id_idx').on(table.imageId),
    index('project_images_project_collection_idx').on(
      table.projectId,
      table.collectionId,
    ),
  ],
);
