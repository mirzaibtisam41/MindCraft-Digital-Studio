'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/Field';
import { FormAlert } from '@/components/ui/FormAlert';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/Spinner';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useUpdateAdminModelMutation } from '@/features/admin/adminApi';
import {
  buildModelDraft,
  buildModelPayload,
} from '@/features/admin/models/modelDraft';
import { getErrorMessage } from '@/lib/apiError';

const TOGGLE_ITEM_CLASS =
  'font-mono text-xs data-[state=on]:border-brand/40 data-[state=on]:bg-brand-tint data-[state=on]:text-foreground';

function MultiChoice({ label, labelId, value, options, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p id={labelId} className="text-sm leading-none font-medium">
        {label}
      </p>
      <ToggleGroup
        type="multiple"
        variant="outline"
        aria-labelledby={labelId}
        value={value}
        onValueChange={onChange}
        className="flex-wrap"
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option}
            value={option}
            className={TOGGLE_ITEM_CLASS}
          >
            {option}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

function DefaultSelect({ id, label, value, options, onChange }) {
  return (
    <Field id={id} label={label}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

function NumberField({ id, label, value, onChange, hint, placeholder }) {
  return (
    <Field id={id} label={label} hint={hint}>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        className="h-10 font-mono"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

function FeatureChips({ features }) {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Code-owned features">
      {Object.entries(features).map(([name, status]) => (
        <li key={name}>
          <Badge tone={status === 'supported' ? 'success' : 'neutral'}>
            {name} · {status}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

export function ModelEditor({ model, editable }) {
  const [updateModel, { isLoading }] = useUpdateAdminModelMutation();
  const [draft, setDraft] = useState(() => buildModelDraft(model));
  const [errors, setErrors] = useState([]);

  const hasDraftChanges =
    JSON.stringify(draft) !== JSON.stringify(buildModelDraft(model));
  const idPrefix = `model-${model.id}`;

  function patch(changes) {
    setErrors([]);
    setDraft((previous) => ({ ...previous, ...changes }));
  }

  function patchList(field, value) {
    patch({ lists: { ...draft.lists, [field]: value } });
  }

  function patchDefault(field, value) {
    patch({ defaults: { ...draft.defaults, [field]: value } });
  }

  async function handleSave() {
    const result = buildModelPayload({ model, draft, editable });

    if (result.errors.length > 0) {
      setErrors(result.errors);

      return;
    }

    if (Object.keys(result.payload).length === 0) {
      toast.info('Nothing to save');

      return;
    }

    try {
      await updateModel({ id: model.id, body: result.payload }).unwrap();
      toast.success(`${model.label} saved`);
    } catch (error) {
      setErrors([getErrorMessage(error)]);
    }
  }

  return (
    <section className="rounded-xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="text-[15px] font-semibold">Configuration</h2>
          <p className="text-[12.5px] text-muted-foreground">
            Pricing, allowed options and defaults users see in the generator.
          </p>
        </div>
        <label
          htmlFor={`${idPrefix}-enabled`}
          className="flex items-center gap-2 text-[13px]"
        >
          {draft.enabled ? 'Enabled' : 'Disabled'}
          <Switch
            id={`${idPrefix}-enabled`}
            checked={draft.enabled}
            onCheckedChange={(checked) => patch({ enabled: checked })}
          />
        </label>
      </div>

      <div className="flex flex-col gap-6 px-5 py-5">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_160px]">
          <Field id={`${idPrefix}-label`} label="Label">
            <Input
              id={`${idPrefix}-label`}
              className="h-10"
              placeholder="Display name"
              value={draft.label}
              onChange={(event) => patch({ label: event.target.value })}
            />
          </Field>
          <NumberField
            id={`${idPrefix}-sort`}
            label="Sort order"
            placeholder="0"
            value={draft.sortOrder}
            onChange={(value) => patch({ sortOrder: value })}
          />
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-[10.5px] font-semibold tracking-wider text-ink-3 uppercase">
            Credits per image
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {draft.lists.qualities.map((quality) => (
              <NumberField
                key={quality}
                id={`${idPrefix}-credits-${quality}`}
                label={`${quality[0].toUpperCase()}${quality.slice(1)} quality`}
                placeholder="1"
                value={draft.credits[quality] ?? ''}
                onChange={(value) =>
                  patch({ credits: { ...draft.credits, [quality]: value } })
                }
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-[10.5px] font-semibold tracking-wider text-ink-3 uppercase">
            Allowed options
          </h3>
          <MultiChoice
            label="Sizes"
            labelId={`${idPrefix}-sizes`}
            value={draft.lists.sizes}
            options={editable.sizes}
            onChange={(value) => patchList('sizes', value)}
          />
          <MultiChoice
            label="Qualities"
            labelId={`${idPrefix}-qualities`}
            value={draft.lists.qualities}
            options={editable.qualities}
            onChange={(value) => patchList('qualities', value)}
          />
          <MultiChoice
            label="Backgrounds"
            labelId={`${idPrefix}-backgrounds`}
            value={draft.lists.backgrounds}
            options={editable.backgrounds}
            onChange={(value) => patchList('backgrounds', value)}
          />
          <MultiChoice
            label="Moderation levels"
            labelId={`${idPrefix}-moderations`}
            value={draft.lists.moderations}
            options={editable.moderations}
            onChange={(value) => patchList('moderations', value)}
          />
          <div className="max-w-[200px]">
            <NumberField
              id={`${idPrefix}-max-images`}
              label="Max images per request"
              placeholder="10"
              value={draft.maxImagesPerRequest}
              onChange={(value) => patch({ maxImagesPerRequest: value })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-[10.5px] font-semibold tracking-wider text-ink-3 uppercase">
            Defaults for new generations
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <DefaultSelect
              id={`${idPrefix}-default-size`}
              label="Size"
              value={draft.defaults.size}
              options={draft.lists.sizes}
              onChange={(value) => patchDefault('size', value)}
            />
            <DefaultSelect
              id={`${idPrefix}-default-quality`}
              label="Quality"
              value={draft.defaults.quality}
              options={draft.lists.qualities}
              onChange={(value) => patchDefault('quality', value)}
            />
            <NumberField
              id={`${idPrefix}-default-n`}
              label="Images"
              placeholder="1"
              value={draft.defaults.n}
              onChange={(value) => patchDefault('n', value)}
            />
            <DefaultSelect
              id={`${idPrefix}-default-background`}
              label="Background"
              value={draft.defaults.background}
              options={draft.lists.backgrounds}
              onChange={(value) => patchDefault('background', value)}
            />
            <DefaultSelect
              id={`${idPrefix}-default-moderation`}
              label="Moderation"
              value={draft.defaults.moderation}
              options={draft.lists.moderations}
              onChange={(value) => patchDefault('moderation', value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-[10.5px] font-semibold tracking-wider text-ink-3 uppercase">
            Features (set by the provider adapter, read-only)
          </h3>
          <FeatureChips features={model.capabilities.features} />
        </div>

        {errors.length > 0 ? (
          <FormAlert>
            {errors.map((message) => (
              <span key={message} className="block">
                {message}
              </span>
            ))}
          </FormAlert>
        ) : null}
      </div>

      <div className="flex justify-end gap-2 border-t px-5 py-3">
        <Button
          type="button"
          variant="ghost"
          disabled={!hasDraftChanges || isLoading}
          onClick={() => {
            setErrors([]);
            setDraft(buildModelDraft(model));
          }}
        >
          Discard
        </Button>
        <Button
          type="button"
          disabled={!hasDraftChanges || isLoading}
          onClick={handleSave}
        >
          {isLoading ? <Spinner /> : null}
          Save changes
        </Button>
      </div>
    </section>
  );
}
