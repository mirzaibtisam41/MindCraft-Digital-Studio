import { PLATFORM_SETTING_KEY } from '#src/modules/platform-settings/platform-setting.constants.js';
import { savePlatformSettingRepository } from '#src/modules/platform-settings/shared/repositories/index.js';
import { readPlatformSettingsService } from '#src/modules/platform-settings/shared/services/index.js';

const KEYS_BY_FIELD = {
  signupCredits: PLATFORM_SETTING_KEY.SIGNUP_CREDITS,
  visionModel: PLATFORM_SETTING_KEY.VISION_MODEL,
  visionCredits: PLATFORM_SETTING_KEY.VISION_CREDITS,
};

export async function updatePlatformSettingsService({ db, data, adminId }) {
  await db.transaction(async (tx) => {
    for (const [field, value] of Object.entries(data)) {
      await savePlatformSettingRepository({
        db: tx,
        key: KEYS_BY_FIELD[field],
        value,
        updatedBy: adminId,
      });
    }
  });

  return readPlatformSettingsService({ db });
}
