export const AI_MODEL_NAME_MAX_LENGTH = 150;

export const AI_MODEL_SLUG_MAX_LENGTH = 150;

export const AI_MODEL_PROVIDER_MODEL_ID_MAX_LENGTH = 150;

export const AI_MODEL_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  DISABLED: 'disabled',
  DEPRECATED: 'deprecated',
};

export const AI_MODEL_STATUSES = Object.values(AI_MODEL_STATUS);

export const AI_MODEL_DESCRIPTION_MAX_LENGTH = 1000;

export const AI_MODEL_PROVIDER_NOT_FOUND_MESSAGE =
  'The selected provider does not exist';

export const AI_MODEL_SLUG_TAKEN_MESSAGE =
  'A model with this slug already exists';

export const AI_MODEL_PROVIDER_MODEL_TAKEN_MESSAGE =
  'This provider already has a model with this provider model ID';

export const AI_MODEL_LIST_DEFAULT_LIMIT = 20;

export const AI_MODEL_LIST_MAX_LIMIT = 100;

export const AI_MODEL_NOT_FOUND_MESSAGE = 'Model not found';

export const AI_MODEL_NEEDS_ENABLED_WORKFLOW_MESSAGE =
  'Turn on at least one workflow before activating this model';

export const AI_MODEL_NEEDS_PRICES_MESSAGE =
  'Set a price for every enabled quality before activating this model';
