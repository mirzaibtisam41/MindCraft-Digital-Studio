import { platformSettings } from '#src/modules/platform-settings/platform-setting.table.js';

export async function savePlatformSettingRepository({
  db,
  key,
  value,
  updatedBy,
}) {
  await db
    .insert(platformSettings)
    .values({ key, value, updatedBy })
    .onConflictDoUpdate({
      target: platformSettings.key,
      set: { value, updatedBy, updatedAt: new Date() },
    });
}
