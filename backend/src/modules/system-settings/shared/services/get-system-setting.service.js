import { SYSTEM_SETTING_DEFAULTS } from '#src/modules/system-settings/system-setting.constants.js';
import * as systemSettingRepositories from '#src/modules/system-settings/shared/repositories/index.js';

export async function getSystemSettingService({ db, key }) {
  const setting = await systemSettingRepositories.findSystemSettingRepository({
    db,
    key,
  });

  return setting ? setting.value : SYSTEM_SETTING_DEFAULTS[key];
}
