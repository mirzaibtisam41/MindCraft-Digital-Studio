import { eq } from 'drizzle-orm';
import { platformSettings } from '#src/modules/platform-settings/platform-setting.table.js';

export async function findPlatformSettingRepository({ db, key }) {
  const [setting] = await db
    .select({ value: platformSettings.value })
    .from(platformSettings)
    .where(eq(platformSettings.key, key))
    .limit(1);

  return setting?.value ?? null;
}
