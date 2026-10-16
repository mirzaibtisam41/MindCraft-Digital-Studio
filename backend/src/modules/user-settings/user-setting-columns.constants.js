import { userSettings } from '#src/modules/user-settings/user-setting.table.js';

export const USER_SETTING_COLUMNS = {
  defaultModelId: userSettings.defaultModelId,
  defaultSize: userSettings.defaultSize,
  defaultQuality: userSettings.defaultQuality,
  defaultImageCount: userSettings.defaultImageCount,
  notifyGenerationFailed: userSettings.notifyGenerationFailed,
  notifyCreditChanges: userSettings.notifyCreditChanges,
  notifyLowCredits: userSettings.notifyLowCredits,
  lowCreditThreshold: userSettings.lowCreditThreshold,
};
