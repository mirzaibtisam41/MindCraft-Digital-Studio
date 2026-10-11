import { NotFoundError } from '#src/utils/index.js';
import * as userSettingRepositories from '#src/modules/userSettings/shared/repositories/index.js';

export async function getMySettingsService({ db, userId }) {
  const settings =
    await userSettingRepositories.findUserSettingsByUserIdRepository({
      db,
      userId,
    });

  if (!settings) {
    throw new NotFoundError('Settings not found');
  }

  return settings;
}
