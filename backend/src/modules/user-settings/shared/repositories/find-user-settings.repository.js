import { eq } from 'drizzle-orm';
import { userSettings } from '#src/modules/user-settings/user-setting.table.js';
import { USER_SETTING_COLUMNS } from '#src/modules/user-settings/user-setting-columns.constants.js';

export async function findUserSettingsRepository({ db, userId }) {
  const [settings] = await db
    .select(USER_SETTING_COLUMNS)
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  return settings ?? null;
}
