'use client';

import { useState } from 'react';

const OPTION_LISTS = {
  size: 'sizes',
  quality: 'qualities',
  outputFormat: 'outputFormats',
};

function keepAllowedOptions({ model, chosenOptions }) {
  const allowed = {};

  for (const [key, value] of Object.entries(chosenOptions)) {
    if (value === undefined || value === null) continue;

    if (key === 'n') {
      if (value >= 1 && value <= model.enabledOptions.maxImagesPerRequest) {
        allowed.n = value;
      }
    } else if (model.enabledOptions[OPTION_LISTS[key]]?.includes(value)) {
      allowed[key] = value;
    }
  }

  return allowed;
}

export function readOptionsFromUrl(searchParams) {
  const options = {};

  for (const key of ['size', 'quality', 'outputFormat']) {
    if (searchParams.get(key)) options[key] = searchParams.get(key);
  }

  if (searchParams.get('n')) options.n = Number(searchParams.get('n'));

  return options;
}

export function useGeneratorOptions({
  models,
  initialModelId = null,
  preferredModelId = null,
  initialOptions = {},
  preferredOptions = {},
}) {
  const [selectedModelId, setSelectedModelId] = useState(initialModelId);
  const [chosenOptions, setChosenOptions] = useState(initialOptions);

  const model =
    models?.find((item) => item.id === selectedModelId) ??
    models?.find((item) => item.id === preferredModelId) ??
    models?.[0] ??
    null;
  const options = model
    ? {
        ...model.defaultOptions,
        quality: model.enabledOptions.qualities.includes(
          model.defaultOptions.quality,
        )
          ? model.defaultOptions.quality
          : model.enabledOptions.qualities[0],
        n: Math.min(
          model.defaultOptions.n,
          model.enabledOptions.maxImagesPerRequest,
        ),
        ...keepAllowedOptions({ model, chosenOptions: preferredOptions }),
        ...keepAllowedOptions({ model, chosenOptions }),
      }
    : null;

  function changeModel(modelId) {
    setSelectedModelId(modelId);
    setChosenOptions({});
  }

  function changeOption(change) {
    setChosenOptions((current) => ({ ...current, ...change }));
  }

  return { model, options, changeModel, changeOption };
}
