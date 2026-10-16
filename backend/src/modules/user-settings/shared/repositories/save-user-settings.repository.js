import { userSettings } from '#src/modules/user-settings/user-setting.table.js';
import { USER_SETTING_COLUMNS } from '#src/modules/user-settings/user-setting-columns.constants.js';

export async function saveUserSettingsRepository({ db, userId, data }) {
  const [settings] = await db
    .insert(userSettings)
    .values({ userId, ...data })
    .onConflictDoUpdate({ target: userSettings.userId, set: data })
    .returning(USER_SETTING_COLUMNS);

  return settings;
}
