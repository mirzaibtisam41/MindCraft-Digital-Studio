export const AUDIT_ACTION = {
  IMAGE_MODEL_CREATED: 'image_model.created',
  IMAGE_MODEL_UPDATED: 'image_model.updated',
  USER_SUSPENDED: 'user.suspended',
  USER_UNSUSPENDED: 'user.unsuspended',
  USER_ROLE_CHANGED: 'user.role_changed',
  CREDITS_ADJUSTED: 'credits.adjusted',
  SETTINGS_UPDATED: 'settings.updated',
};

export const AUDIT_ACTIONS = Object.values(AUDIT_ACTION);

export const AUDIT_TARGET_TYPE = {
  IMAGE_MODEL: 'image_model',
  USER: 'user',
  SYSTEM_SETTING: 'system_setting',
};

export const AUDIT_ACTION_MAX_LENGTH = 50;

export const AUDIT_TARGET_TYPE_MAX_LENGTH = 50;

export const AUDIT_TARGET_ID_MAX_LENGTH = 100;
