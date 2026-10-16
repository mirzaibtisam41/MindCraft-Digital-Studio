import {
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from '#src/modules/users/user.table.js';
import { images } from '#src/modules/images/image.table.js';
import { PROJECT_NAME_MAX_LENGTH } from '#src/modules/projects/project.constants.js';

export const projects = pgTable(
  'projects',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar({ length: PROJECT_NAME_MAX_LENGTH }).notNull(),
    description: text(),
    coverImageId: uuid(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    foreignKey({
      name: 'projects_cover_image_fk',
      columns: [table.coverImageId],
      foreignColumns: [images.id],
    }).onDelete('set null'),
    index('projects_user_id_updated_at_idx').on(table.userId, table.updatedAt),
  ],
);
