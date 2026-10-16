'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Field } from '@/components/ui/Field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  QUALITY_LABELS,
  SIZE_LABELS,
} from '@/features/generations/generationLabels';
import { useGetGenerationOptionsQuery } from '@/features/generations/generationsApi';
import { SettingsCard } from '@/features/settings/SettingsCard';
import {
  useGetMySettingsQuery,
  useUpdateMySettingsMutation,
} from '@/features/settings/settingsApi';
import { getErrorMessage } from '@/lib/apiError';

const AUTOMATIC = 'automatic';
const FIELDS = [
  'defaultModelId',
  'defaultSize',
  'defaultQuality',
  'defaultImageCount',
];

function pickDefaults(settings) {
  return Object.fromEntries(FIELDS.map((field) => [field, settings[field]]));
}

function DefaultSelect({ id, label, hint, value, onChange, items }) {
  return (
    <Field id={id} label={label} hint={hint}>
      <Select
        value={value === null ? AUTOMATIC : String(value)}
        onValueChange={(next) => onChange(next === AUTOMATIC ? null : next)}
      >
        <SelectTrigger id={id} aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={AUTOMATIC}>Model default</SelectItem>
          {items.map((item) => (
            <SelectItem key={item.value} value={String(item.value)}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

function GenerationDefaultsForm({ settings, models }) {
  const saved = pickDefaults(settings);
  const [values, setValues] = useState(saved);
  const [errorMessage, setErrorMessage] = useState('');
  const [updateMySettings, { isLoading }] = useUpdateMySettingsMutation();
  const isDirty = FIELDS.some((field) => values[field] !== saved[field]);
  const model =
    models.find((item) => item.id === values.defaultModelId) ?? null;
  const sizes = model?.enabledOptions.sizes ?? [
    ...new Set(models.flatMap((item) => item.enabledOptions.sizes)),
  ];
  const qualities = model?.enabledOptions.qualities ?? [
    ...new Set(models.flatMap((item) => item.enabledOptions.qualities)),
  ];
  const maxImages =
    model?.enabledOptions.maxImagesPerRequest ??
    Math.max(
      1,
      ...models.map((item) => item.enabledOptions.maxImagesPerRequest),
    );

  function update(change) {
    setValues((current) => ({ ...current, ...change }));
  }

  async function save() {
    setErrorMessage('');

    try {
      await updateMySettings(values).unwrap();
      toast.success('Generation defaults saved');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  return (
    <SettingsCard
      title="Generation defaults"
      description="What the Image Generator starts with. A reused prompt or link still uses its own settings, and options a model does not have are skipped."
      errorMessage={errorMessage}
      isDirty={isDirty}
      isSaving={isLoading}
      onSave={save}
      onDiscard={() => {
        setValues(saved);
        setErrorMessage('');
      }}
    >
      <DefaultSelect
        id="default-model"
        label="Model"
        hint="Model default uses the first model in the list."
        value={values.defaultModelId}
        onChange={(defaultModelId) => update({ defaultModelId })}
        items={models.map((item) => ({ value: item.id, label: item.name }))}
      />
      <div className="grid gap-5 sm:grid-cols-3">
        <DefaultSelect
          id="default-size"
          label="Aspect ratio"
          value={values.defaultSize}
          onChange={(defaultSize) => update({ defaultSize })}
          items={sizes.map((size) => ({
            value: size,
            label: `${SIZE_LABELS[size] ?? size} · ${size.replace('x', ' × ')}`,
          }))}
        />
        <DefaultSelect
          id="default-quality"
          label="Quality"
          value={values.defaultQuality}
          onChange={(defaultQuality) => update({ defaultQuality })}
          items={qualities.map((quality) => ({
            value: quality,
            label: QUALITY_LABELS[quality] ?? quality,
          }))}
        />
        <DefaultSelect
          id="default-count"
          label="Images"
          value={values.defaultImageCount}
          onChange={(count) =>
            update({ defaultImageCount: count === null ? null : Number(count) })
          }
          items={Array.from({ length: maxImages }, (_, index) => ({
            value: index + 1,
            label: String(index + 1),
          }))}
        />
      </div>
    </SettingsCard>
  );
}

export function GenerationDefaultsSettings() {
  const settings = useGetMySettingsQuery();
  const options = useGetGenerationOptionsQuery();

  if (settings.error || options.error) {
    return (
      <p className="text-sm text-danger">
        {getErrorMessage(settings.error ?? options.error)}
      </p>
    );
  }

  if (!settings.data || !options.data) return <Skeleton className="h-72" />;

  return (
    <GenerationDefaultsForm settings={settings.data} models={options.data} />
  );
}
