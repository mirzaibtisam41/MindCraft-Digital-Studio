import {
  AUDIT_ACTION,
  AUDIT_TARGET_TYPE,
} from '#src/modules/audit-logs/audit-log.constants.js';
import { recordAuditLogService } from '#src/modules/audit-logs/shared/services/index.js';
import { getAdminSettingsService } from '#src/modules/admin/shared/services/index.js';
import { SYSTEM_SETTING_KEY } from '#src/modules/system-settings/system-setting.constants.js';
import * as systemSettingRepositories from '#src/modules/system-settings/shared/repositories/index.js';

const INPUT_FIELD_TO_KEY = {
  signupCredits: SYSTEM_SETTING_KEY.SIGNUP_CREDITS,
};

export async function updateSettingsService({ db, actorId, input }) {
  return db.transaction(async (tx) => {
    const before = await getAdminSettingsService({ db: tx });
    const changes = {};

    for (const [field, key] of Object.entries(INPUT_FIELD_TO_KEY)) {
      if (input[field] === undefined || input[field] === before[field]) {
        continue;
      }

      await systemSettingRepositories.upsertSystemSettingRepository({
        db: tx,
        key,
        value: input[field],
      });

      changes[field] = { from: before[field], to: input[field] };
    }

    if (Object.keys(changes).length > 0) {
      await recordAuditLogService({
        db: tx,
        actorId,
        action: AUDIT_ACTION.SETTINGS_UPDATED,
        targetType: AUDIT_TARGET_TYPE.SYSTEM_SETTING,
        targetId: Object.keys(changes).join(','),
        changes,
      });
    }

    return getAdminSettingsService({ db: tx });
  });
}
