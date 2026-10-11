import { eq } from 'drizzle-orm';
import { userSettings } from '#src/modules/userSettings/user-setting.table.js';

export async function updateUserSettingsRepository({ db, userId, data }) {
  const [settings] = await db
    .update(userSettings)
    .set(data)
    .where(eq(userSettings.userId, userId))
    .returning();

  return settings ?? null;
}
