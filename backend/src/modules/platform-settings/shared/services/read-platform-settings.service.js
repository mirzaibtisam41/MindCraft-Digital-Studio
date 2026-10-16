import { PLATFORM_SETTING_KEY } from '#src/modules/platform-settings/platform-setting.constants.js';
import { findPlatformSettingRepository } from '#src/modules/platform-settings/shared/repositories/index.js';
import { getVisionSettingsService } from '#src/modules/platform-settings/shared/services/get-vision-settings.service.js';

export async function readPlatformSettingsService({ db }) {
  const [signupCredits, vision] = await Promise.all([
    findPlatformSettingRepository({
      db,
      key: PLATFORM_SETTING_KEY.SIGNUP_CREDITS,
    }),
    getVisionSettingsService({ db }),
  ]);

  return {
    signupCredits: signupCredits ?? 0,
    visionModel: vision.model,
    visionCredits: vision.credits,
  };
}
