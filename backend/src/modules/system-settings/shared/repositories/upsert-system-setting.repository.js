import { systemSettings } from '#src/modules/system-settings/system-setting.table.js';

export async function upsertSystemSettingRepository({ db, key, value }) {
  const [setting] = await db
    .insert(systemSettings)
    .values({ key, value })
    .onConflictDoUpdate({ target: systemSettings.key, set: { value } })
    .returning();

  return setting;
}
