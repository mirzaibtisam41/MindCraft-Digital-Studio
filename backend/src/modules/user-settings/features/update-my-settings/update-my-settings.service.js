import { NotFoundError } from '#src/utils/index.js';
import * as userSettingRepositories from '#src/modules/user-settings/shared/repositories/index.js';

export async function updateMySettingsService({ db, userId, data }) {
  const settings = await userSettingRepositories.updateUserSettingsRepository({
    db,
    userId,
    data,
  });

  if (!settings) {
    throw new NotFoundError('Settings not found');
  }

  return settings;
}
