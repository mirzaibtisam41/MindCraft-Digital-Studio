import { NO_BADGE_VALUE } from '@/constants/admin';

const DEFAULT_FIELDS = [
  'size',
  'quality',
  'background',
  'moderation',
  'outputFormat',
];
const LIST_FIELDS = [
  'sizes',
  'qualities',
  'backgrounds',
  'moderations',
  'outputFormats',
];
const LIST_BY_DEFAULT_FIELD = {
  size: 'sizes',
  quality: 'qualities',
  background: 'backgrounds',
  moderation: 'moderations',
  outputFormat: 'outputFormats',
};

function stringifyPerQuality(qualities, values) {
  return Object.fromEntries(
    qualities.map((quality) => [
      quality,
      values?.[quality] === undefined ? '' : String(values[quality]),
    ]),
  );
}

export function buildModelDraft(model) {
  const { capabilities } = model;

  return {
    label: model.label,
    description: model.description ?? '',
    badge: model.badge ?? NO_BADGE_VALUE,
    enabled: model.enabled,
    sortOrder: String(model.sortOrder),
    tools: [...model.tools],
    credits: stringifyPerQuality(capabilities.qualities, model.creditsPerImage),
    providerCost: stringifyPerQuality(
      capabilities.qualities,
      model.providerCostPerImage,
    ),
    lists: Object.fromEntries(
      LIST_FIELDS.map((field) => [field, [...(capabilities[field] ?? [])]]),
    ),
    maxImagesPerRequest: String(capabilities.maxImagesPerRequest),
    defaults: {
      size: capabilities.defaults.size,
      quality: capabilities.defaults.quality,
      n: String(capabilities.defaults.n),
      background: capabilities.defaults.background,
      moderation: capabilities.defaults.moderation,
      outputFormat: capabilities.defaults.outputFormat,
    },
  };
}

function isWholeNumber(value, min, max) {
  const parsed = Number(value);

  return (
    String(value).trim() !== '' &&
    Number.isInteger(parsed) &&
    parsed >= min &&
    parsed <= max
  );
}

function isAmount(value, min, max) {
  const parsed = Number(value);

  return (
    String(value).trim() !== '' &&
    Number.isFinite(parsed) &&
    parsed >= min &&
    parsed <= max
  );
}

function sameSet(left, right) {
  return (
    left.length === right.length && left.every((item) => right.includes(item))
  );
}

function orderLike(selected, allowed) {
  return allowed.filter((item) => selected.includes(item));
}

function validateDraft({ draft, editable }) {
  const errors = [];

  if (!draft.label.trim()) errors.push('Display name cannot be empty.');

  if (draft.description.trim().length > editable.descriptionMaxLength) {
    errors.push(
      `Description must be at most ${editable.descriptionMaxLength} characters.`,
    );
  }

  if (!isWholeNumber(draft.sortOrder, 0, editable.sortOrderMax)) {
    errors.push(`Sort order must be between 0 and ${editable.sortOrderMax}.`);
  }

  if (draft.tools.length === 0) errors.push('Select at least one tool.');

  for (const field of LIST_FIELDS) {
    if (draft.lists[field].length === 0) {
      errors.push(`Select at least one option for ${field}.`);
    }
  }

  const credits = editable.creditsPerImage;
  const cost = editable.providerCostPerImage;

  for (const quality of draft.lists.qualities) {
    if (!isWholeNumber(draft.credits[quality], credits.min, credits.max)) {
      errors.push(
        `Credit price for ${quality} must be between ${credits.min} and ${credits.max}.`,
      );
    }

    const costValue = draft.providerCost[quality] ?? '';

    if (costValue.trim() !== '' && !isAmount(costValue, cost.min, cost.max)) {
      errors.push(
        `Provider cost for ${quality} must be between $${cost.min} and $${cost.max}.`,
      );
    }
  }

  if (
    !isWholeNumber(draft.maxImagesPerRequest, 1, editable.maxImagesPerRequest)
  ) {
    errors.push(
      `Max images per request must be between 1 and ${editable.maxImagesPerRequest}.`,
    );
  }

  if (!isWholeNumber(draft.defaults.n, 1, editable.maxImagesPerRequest)) {
    errors.push('Default image count is not valid.');
  } else if (Number(draft.defaults.n) > Number(draft.maxImagesPerRequest)) {
    errors.push(
      'Default image count cannot exceed the max images per request.',
    );
  }

  for (const field of DEFAULT_FIELDS) {
    if (
      !draft.lists[LIST_BY_DEFAULT_FIELD[field]].includes(draft.defaults[field])
    ) {
      errors.push(`Default ${field} must be one of the allowed options.`);
    }
  }

  return errors;
}

function buildCapabilityChanges({ model, draft, editable }) {
  const current = model.capabilities;
  const changes = {};

  for (const field of LIST_FIELDS) {
    const next = orderLike(draft.lists[field], editable[field]);

    if (!sameSet(next, current[field] ?? [])) changes[field] = next;
  }

  const maxImages = Number(draft.maxImagesPerRequest);

  if (maxImages !== current.maxImagesPerRequest) {
    changes.maxImagesPerRequest = maxImages;
  }

  const defaults = {};

  for (const field of DEFAULT_FIELDS) {
    if (draft.defaults[field] !== current.defaults[field]) {
      defaults[field] = draft.defaults[field];
    }
  }

  const defaultCount = Number(draft.defaults.n);

  if (defaultCount !== current.defaults.n) defaults.n = defaultCount;

  if (Object.keys(defaults).length > 0) changes.defaults = defaults;

  return changes;
}

function buildPerQualityChanges({ qualities, draftValues, currentValues }) {
  const changes = {};

  for (const quality of qualities) {
    const raw = draftValues[quality] ?? '';

    if (raw.trim() === '') continue;

    const next = Number(raw);

    if (next !== currentValues?.[quality]) changes[quality] = next;
  }

  return changes;
}

export function buildModelPayload({ model, draft, editable }) {
  const errors = validateDraft({ draft, editable });

  if (errors.length > 0) return { errors, payload: {} };

  const payload = {};
  const badge = draft.badge === NO_BADGE_VALUE ? null : draft.badge;

  if (draft.label.trim() !== model.label) payload.label = draft.label.trim();

  if (draft.description.trim() !== (model.description ?? '')) {
    payload.description = draft.description.trim();
  }

  if (badge !== model.badge) payload.badge = badge;
  if (draft.enabled !== model.enabled) payload.enabled = draft.enabled;

  if (Number(draft.sortOrder) !== model.sortOrder) {
    payload.sortOrder = Number(draft.sortOrder);
  }

  const tools = orderLike(draft.tools, editable.tools);

  if (!sameSet(tools, model.tools)) payload.tools = tools;

  const credits = buildPerQualityChanges({
    qualities: draft.lists.qualities,
    draftValues: draft.credits,
    currentValues: model.creditsPerImage,
  });

  if (Object.keys(credits).length > 0) payload.creditsPerImage = credits;

  const providerCost = buildPerQualityChanges({
    qualities: draft.lists.qualities,
    draftValues: draft.providerCost,
    currentValues: model.providerCostPerImage,
  });

  if (Object.keys(providerCost).length > 0) {
    payload.providerCostPerImage = providerCost;
  }

  const capabilities = buildCapabilityChanges({ model, draft, editable });

  if (Object.keys(capabilities).length > 0) payload.capabilities = capabilities;

  return { errors: [], payload };
}
