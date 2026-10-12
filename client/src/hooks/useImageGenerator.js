'use client';

import { useState } from 'react';
import { useGetProfileQuery } from '@/features/auth/authApi';
import {
  useGenerateImagesMutation,
  useGetImageOptionsQuery,
} from '@/features/generator/generatorApi';
import { useGetSettingsQuery } from '@/features/settings/settingsApi';
import { estimateCost } from '@/lib/credits';

const FALLBACK_ASPECT_RATIO = '1:1';

function pickAspectRatio({ model, preferred, current }) {
  if (!model) return current ?? FALLBACK_ASPECT_RATIO;
  if (current && model.aspectRatios.includes(current)) return current;
  if (preferred && model.aspectRatios.includes(preferred)) return preferred;
  if (model.aspectRatios.includes(FALLBACK_ASPECT_RATIO)) {
    return FALLBACK_ASPECT_RATIO;
  }

  return model.aspectRatios[0];
}

function pickOption({ allowed, current, fallback }) {
  return allowed.includes(current) ? current : fallback;
}

export function useImageGenerator({ initialPrompt = '' }) {
  const options = useGetImageOptionsQuery();
  const { data: user } = useGetProfileQuery();
  const { data: settings } = useGetSettingsQuery();
  const [generateImages, generation] = useGenerateImagesMutation();
  const [values, setValues] = useState({
    prompt: initialPrompt,
    modelId: null,
    aspectRatio: null,
    quality: null,
    count: 1,
    style: null,
  });
  const [results, setResults] = useState([]);
  const [failure, setFailure] = useState(null);

  const models = options.data?.models ?? [];
  const model =
    models.find(({ id }) => id === values.modelId) ??
    models.find(({ id }) => id === options.data?.defaultModel) ??
    models[0] ??
    null;

  const aspectRatio = pickAspectRatio({
    model,
    preferred: settings?.defaultAspectRatio,
    current: values.aspectRatio,
  });
  const quality = model
    ? pickOption({
        allowed: model.qualities,
        current: values.quality,
        fallback: model.defaults.quality,
      })
    : null;
  const count = model
    ? Math.min(values.count, model.maxImagesPerRequest)
    : values.count;
  const cost = estimateCost({ model, quality, count });
  const balance = user?.creditBalance ?? null;
  const hasEnoughCredits =
    cost === null || balance === null ? true : balance >= cost.total;
  const maxAffordableCount =
    cost && balance !== null ? Math.floor(balance / cost.perImage) : null;

  function change(key, value) {
    setValues((previous) => ({ ...previous, [key]: value }));
  }

  async function submit() {
    setFailure(null);

    try {
      const body = {
        prompt: values.prompt.trim(),
        model: model.id,
        aspectRatio,
        quality,
        n: count,
      };

      if (values.style) body.style = values.style;

      const result = await generateImages(body).unwrap();

      setResults((previous) => [result, ...previous]);
    } catch (error) {
      setFailure(error);
    }
  }

  return {
    options,
    model,
    models,
    styles: options.data?.styles ?? [],
    values: { ...values, aspectRatio, quality, count },
    change,
    cost,
    balance,
    hasEnoughCredits,
    maxAffordableCount,
    isGenerating: generation.isLoading,
    failure,
    results,
    submit,
    dismissFailure: () => setFailure(null),
  };
}
