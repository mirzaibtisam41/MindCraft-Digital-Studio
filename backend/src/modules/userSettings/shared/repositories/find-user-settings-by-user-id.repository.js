import { eq } from 'drizzle-orm';
import { userSettings } from '#src/modules/userSettings/user-setting.table.js';

export async function findUserSettingsByUserIdRepository({ db, userId }) {
  const [settings] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  return settings ?? null;
}
