import { userSettings } from '#src/modules/userSettings/user-setting.table.js';

export async function insertUserSettingsRepository({ db, userId }) {
  const [settings] = await db
    .insert(userSettings)
    .values({ userId })
    .returning();

  return settings;
}
