import { DEFAULT_USER_SETTINGS } from '#src/modules/user-settings/user-setting.constants.js';
import { findUserSettingsRepository } from '#src/modules/user-settings/shared/repositories/index.js';

export async function readUserSettingsService({ db, userId }) {
  const settings = await findUserSettingsRepository({ db, userId });

  return settings ?? DEFAULT_USER_SETTINGS;
}
