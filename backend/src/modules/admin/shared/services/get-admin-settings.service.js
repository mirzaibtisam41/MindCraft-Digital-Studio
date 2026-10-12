import { SYSTEM_SETTING_KEY } from '#src/modules/system-settings/system-setting.constants.js';
import { getSystemSettingService } from '#src/modules/system-settings/shared/services/index.js';

export async function getAdminSettingsService({ db }) {
  return {
    signupCredits: await getSystemSettingService({
      db,
      key: SYSTEM_SETTING_KEY.SIGNUP_CREDITS,
    }),
  };
}
