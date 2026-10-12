const DEFAULT_FIELDS = ['size', 'quality', 'background', 'moderation'];
const LIST_FIELDS = ['sizes', 'qualities', 'backgrounds', 'moderations'];

export function buildModelDraft(model) {
  const { capabilities } = model;

  return {
    label: model.label,
    enabled: model.enabled,
    sortOrder: String(model.sortOrder),
    credits: Object.fromEntries(
      capabilities.qualities.map((quality) => [
        quality,
        String(model.creditsPerImage[quality] ?? ''),
      ]),
    ),
    lists: Object.fromEntries(
      LIST_FIELDS.map((field) => [field, [...capabilities[field]]]),
    ),
    maxImagesPerRequest: String(capabilities.maxImagesPerRequest),
    defaults: {
      size: capabilities.defaults.size,
      quality: capabilities.defaults.quality,
      n: String(capabilities.defaults.n),
      background: capabilities.defaults.background,
      moderation: capabilities.defaults.moderation,
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

  if (!draft.label.trim()) errors.push('Label cannot be empty.');

  if (!isWholeNumber(draft.sortOrder, 0, editable.sortOrderMax)) {
    errors.push(`Sort order must be between 0 and ${editable.sortOrderMax}.`);
  }

  for (const field of LIST_FIELDS) {
    if (draft.lists[field].length === 0) {
      errors.push(`Select at least one option for ${field}.`);
    }
  }

  const { min, max } = editable.creditsPerImage;

  for (const quality of draft.lists.qualities) {
    if (!isWholeNumber(draft.credits[quality], min, max)) {
      errors.push(
        `Credit price for ${quality} must be between ${min} and ${max}.`,
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

  const defaultsByList = {
    size: 'sizes',
    quality: 'qualities',
    background: 'backgrounds',
    moderation: 'moderations',
  };

  for (const field of DEFAULT_FIELDS) {
    if (!draft.lists[defaultsByList[field]].includes(draft.defaults[field])) {
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

    if (!sameSet(next, current[field])) changes[field] = next;
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

export function buildModelPayload({ model, draft, editable }) {
  const errors = validateDraft({ draft, editable });

  if (errors.length > 0) return { errors, payload: {} };

  const payload = {};

  if (draft.label.trim() !== model.label) payload.label = draft.label.trim();
  if (draft.enabled !== model.enabled) payload.enabled = draft.enabled;

  if (Number(draft.sortOrder) !== model.sortOrder) {
    payload.sortOrder = Number(draft.sortOrder);
  }

  const credits = {};

  for (const quality of draft.lists.qualities) {
    const next = Number(draft.credits[quality]);

    if (next !== model.creditsPerImage[quality]) credits[quality] = next;
  }

  if (Object.keys(credits).length > 0) payload.creditsPerImage = credits;

  const capabilities = buildCapabilityChanges({ model, draft, editable });

  if (Object.keys(capabilities).length > 0) payload.capabilities = capabilities;

  return { errors: [], payload };
}
