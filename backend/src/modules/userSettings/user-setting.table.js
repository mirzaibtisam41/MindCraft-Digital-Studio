import {
  boolean,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from '#src/modules/users/user.table.js';
import {
  DEFAULT_ASPECT_RATIO,
  THEME,
  THEMES,
  USER_SETTING_ASPECT_RATIO_MAX_LENGTH,
  USER_SETTING_DEFAULT_MODEL_MAX_LENGTH,
} from './user-setting.constants.js';

export const themeEnum = pgEnum('theme', THEMES);

export const userSettings = pgTable('user_settings', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  defaultModel: varchar('default_model', {
    length: USER_SETTING_DEFAULT_MODEL_MAX_LENGTH,
  }),
  defaultAspectRatio: varchar('default_aspect_ratio', {
    length: USER_SETTING_ASPECT_RATIO_MAX_LENGTH,
  })
    .notNull()
    .default(DEFAULT_ASPECT_RATIO),
  autoEnhancePrompts: boolean('auto_enhance_prompts').notNull().default(false),
  saveOriginalsWithEdits: boolean('save_originals_with_edits')
    .notNull()
    .default(true),
  notifyGenerationComplete: boolean('notify_generation_complete')
    .notNull()
    .default(true),
  notifyGenerationFailed: boolean('notify_generation_failed')
    .notNull()
    .default(true),
  notifyLowCredits: boolean('notify_low_credits').notNull().default(true),
  notifyProductUpdates: boolean('notify_product_updates')
    .notNull()
    .default(false),
  theme: themeEnum('theme').notNull().default(THEME.DARK),
  reduceMotion: boolean('reduce_motion').notNull().default(false),
  onboardingCompletedAt: timestamp('onboarding_completed_at', {
    withTimezone: true,
  }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
