import { PLATFORM_SETTING_KEY } from '#src/modules/platform-settings/platform-setting.constants.js';
import { savePlatformSettingRepository } from '#src/modules/platform-settings/shared/repositories/index.js';

export async function updatePlatformSettingsService({ db, data, adminId }) {
  await savePlatformSettingRepository({
    db,
    key: PLATFORM_SETTING_KEY.SIGNUP_CREDITS,
    value: data.signupCredits,
    updatedBy: adminId,
  });

  return { signupCredits: data.signupCredits };
}
