import { eq } from 'drizzle-orm';
import { systemSettings } from '#src/modules/system-settings/system-setting.table.js';

export async function findSystemSettingRepository({ db, key }) {
  const [setting] = await db
    .select()
    .from(systemSettings)
    .where(eq(systemSettings.key, key))
    .limit(1);

  return setting ?? null;
}
