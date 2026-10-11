import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import {
  USER_EMAIL_MAX_LENGTH,
  USER_NAME_MAX_LENGTH,
  USER_PASSWORD_HASH_MAX_LENGTH,
} from './user.constants.js';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: USER_NAME_MAX_LENGTH }).notNull(),
  email: varchar('email', { length: USER_EMAIL_MAX_LENGTH }).notNull().unique(),
  passwordHash: varchar('password_hash', {
    length: USER_PASSWORD_HASH_MAX_LENGTH,
  }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
