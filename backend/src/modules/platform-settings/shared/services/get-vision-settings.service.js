import { PLATFORM_SETTING_KEY } from '#src/modules/platform-settings/platform-setting.constants.js';
import { findPlatformSettingRepository } from '#src/modules/platform-settings/shared/repositories/index.js';

export async function getVisionSettingsService({ db }) {
  const [model, credits] = await Promise.all([
    findPlatformSettingRepository({
      db,
      key: PLATFORM_SETTING_KEY.VISION_MODEL,
    }),
    findPlatformSettingRepository({
      db,
      key: PLATFORM_SETTING_KEY.VISION_CREDITS,
    }),
  ]);

  return { model: model ?? 'gpt-4.1-mini', credits: credits ?? 1 };
}
