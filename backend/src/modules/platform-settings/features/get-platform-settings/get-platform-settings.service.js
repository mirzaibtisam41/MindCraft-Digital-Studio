import { PLATFORM_SETTING_KEY } from '#src/modules/platform-settings/platform-setting.constants.js';
import { findPlatformSettingRepository } from '#src/modules/platform-settings/shared/repositories/index.js';

export async function getPlatformSettingsService({ db }) {
  const signupCredits = await findPlatformSettingRepository({
    db,
    key: PLATFORM_SETTING_KEY.SIGNUP_CREDITS,
  });

  return { signupCredits: signupCredits ?? 0 };
}
