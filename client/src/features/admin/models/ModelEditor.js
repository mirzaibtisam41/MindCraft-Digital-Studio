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
import {
  IMAGE_MODEL_BADGE_LABELS,
  IMAGE_MODEL_TOOL_LABELS,
  NO_BADGE_VALUE,
} from '@/constants/admin';
import { useUpdateAdminModelMutation } from '@/features/admin/adminApi';
import {
  buildModelDraft,
  buildModelPayload,
} from '@/features/admin/models/modelDraft';
import { getErrorMessage } from '@/lib/apiError';

const TOGGLE_ITEM_CLASS =
  'text-xs data-[state=on]:border-brand/40 data-[state=on]:bg-brand-tint data-[state=on]:text-foreground';

function capitalize(value) {
  return `${value[0].toUpperCase()}${value.slice(1)}`;
}

function Section({ title, description, children }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-[10.5px] font-semibold tracking-wider text-ink-3 uppercase">
          {title}
        </h3>
        {description ? (
          <p className="text-[12.5px] text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function MultiChoice({
  label,
  labelId,
  value,
  options,
  onChange,
  mono = true,
}) {
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
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className={`${TOGGLE_ITEM_CLASS} ${mono ? 'font-mono' : ''}`}
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

function OptionSelect({ id, label, value, options, onChange }) {
  return (
    <Field id={id} label={label}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

function NumberField({ id, label, value, onChange, hint, placeholder, step }) {
  return (
    <Field id={id} label={label} hint={hint}>
      <Input
        id={id}
        type="number"
        inputMode={step ? 'decimal' : 'numeric'}
        step={step}
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
    <ul className="flex flex-wrap gap-1.5" aria-label="Provider features">
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

function asOptions(values) {
  return values.map((value) => ({ value, label: value }));
}

export function ModelEditor({ model, editable }) {
  const [updateModel, { isLoading }] = useUpdateAdminModelMutation();
  const [draft, setDraft] = useState(() => buildModelDraft(model));
  const [errors, setErrors] = useState([]);

  const hasDraftChanges =
    JSON.stringify(draft) !== JSON.stringify(buildModelDraft(model));
  const idPrefix = `model-${model.id}`;
  const features = model.capabilities.features ?? {};

  const toolOptions = editable.tools.map((tool) => {
    const supported = features[editable.toolFeatures[tool]] === 'supported';

    return {
      value: tool,
      label: supported
        ? IMAGE_MODEL_TOOL_LABELS[tool]
        : `${IMAGE_MODEL_TOOL_LABELS[tool]} (not supported)`,
      disabled: !supported && !draft.tools.includes(tool),
    };
  });

  const badgeOptions = [
    { value: NO_BADGE_VALUE, label: 'No badge' },
    ...editable.badges.map((badge) => ({
      value: badge,
      label: IMAGE_MODEL_BADGE_LABELS[badge] ?? badge,
    })),
  ];

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

  function patchPerQuality(field, quality, value) {
    patch({ [field]: { ...draft[field], [quality]: value } });
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
      toast.success(`${draft.label.trim()} saved`);
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
            What users see in the model picker, what it costs and which options
            they can choose.
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

      <div className="flex flex-col gap-8 px-5 py-6">
        <Section
          title="Details"
          description="Shown to users when they pick a model."
        >
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_200px_140px]">
            <Field id={`${idPrefix}-label`} label="Display name">
              <Input
                id={`${idPrefix}-label`}
                className="h-10"
                placeholder="GPT Image 1"
                value={draft.label}
                onChange={(event) => patch({ label: event.target.value })}
              />
            </Field>
            <OptionSelect
              id={`${idPrefix}-badge`}
              label="Badge"
              value={draft.badge}
              options={badgeOptions}
              onChange={(value) => patch({ badge: value })}
            />
            <NumberField
              id={`${idPrefix}-sort`}
              label="Sort order"
              placeholder="0"
              value={draft.sortOrder}
              onChange={(value) => patch({ sortOrder: value })}
            />
          </div>
          <Field
            id={`${idPrefix}-description`}
            label="Description"
            hint={`${draft.description.length}/${editable.descriptionMaxLength} · One line, e.g. "Fast and cheap, great for drafts"`}
          >
            <Input
              id={`${idPrefix}-description`}
              className="h-10"
              maxLength={editable.descriptionMaxLength}
              placeholder="What is this model good at?"
              value={draft.description}
              onChange={(event) => patch({ description: event.target.value })}
            />
          </Field>
        </Section>

        <Section
          title="Tools"
          description="Where users can pick this model. Only tools the provider supports can be turned on."
        >
          <MultiChoice
            label="Available in"
            labelId={`${idPrefix}-tools`}
            value={draft.tools}
            options={toolOptions}
            onChange={(value) => patch({ tools: value })}
            mono={false}
          />
        </Section>

        <Section
          title="Pricing"
          description="Credits are charged to users. Provider cost is what the provider bills you, in US dollars. It is only used for admin reports."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {draft.lists.qualities.map((quality) => (
              <div
                key={quality}
                className="flex flex-col gap-3 rounded-lg border p-4"
              >
                <p className="text-[13px] font-medium">
                  {capitalize(quality)} quality
                </p>
                <NumberField
                  id={`${idPrefix}-credits-${quality}`}
                  label="Credits per image"
                  placeholder="1"
                  value={draft.credits[quality] ?? ''}
                  onChange={(value) =>
                    patchPerQuality('credits', quality, value)
                  }
                />
                <NumberField
                  id={`${idPrefix}-cost-${quality}`}
                  label="Provider cost ($)"
                  placeholder="0.011"
                  step="0.001"
                  value={draft.providerCost[quality] ?? ''}
                  onChange={(value) =>
                    patchPerQuality('providerCost', quality, value)
                  }
                />
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Allowed options"
          description="Users can only choose from these."
        >
          <MultiChoice
            label="Sizes"
            labelId={`${idPrefix}-sizes`}
            value={draft.lists.sizes}
            options={asOptions(editable.sizes)}
            onChange={(value) => patchList('sizes', value)}
          />
          <MultiChoice
            label="Qualities"
            labelId={`${idPrefix}-qualities`}
            value={draft.lists.qualities}
            options={asOptions(editable.qualities)}
            onChange={(value) => patchList('qualities', value)}
          />
          <MultiChoice
            label="Output formats"
            labelId={`${idPrefix}-output-formats`}
            value={draft.lists.outputFormats}
            options={asOptions(editable.outputFormats)}
            onChange={(value) => patchList('outputFormats', value)}
          />
          <MultiChoice
            label="Backgrounds"
            labelId={`${idPrefix}-backgrounds`}
            value={draft.lists.backgrounds}
            options={asOptions(editable.backgrounds)}
            onChange={(value) => patchList('backgrounds', value)}
          />
          <MultiChoice
            label="Moderation levels"
            labelId={`${idPrefix}-moderations`}
            value={draft.lists.moderations}
            options={asOptions(editable.moderations)}
            onChange={(value) => patchList('moderations', value)}
          />
          <div className="max-w-50">
            <NumberField
              id={`${idPrefix}-max-images`}
              label="Max images per request"
              placeholder="10"
              value={draft.maxImagesPerRequest}
              onChange={(value) => patch({ maxImagesPerRequest: value })}
            />
          </div>
        </Section>

        <Section
          title="Defaults for new generations"
          description="Preselected in the generator. Users can change them."
        >
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <OptionSelect
              id={`${idPrefix}-default-size`}
              label="Size"
              value={draft.defaults.size}
              options={asOptions(draft.lists.sizes)}
              onChange={(value) => patchDefault('size', value)}
            />
            <OptionSelect
              id={`${idPrefix}-default-quality`}
              label="Quality"
              value={draft.defaults.quality}
              options={asOptions(draft.lists.qualities)}
              onChange={(value) => patchDefault('quality', value)}
            />
            <OptionSelect
              id={`${idPrefix}-default-output-format`}
              label="Format"
              value={draft.defaults.outputFormat}
              options={asOptions(draft.lists.outputFormats)}
              onChange={(value) => patchDefault('outputFormat', value)}
            />
            <NumberField
              id={`${idPrefix}-default-n`}
              label="Images"
              placeholder="1"
              value={draft.defaults.n}
              onChange={(value) => patchDefault('n', value)}
            />
            <OptionSelect
              id={`${idPrefix}-default-background`}
              label="Background"
              value={draft.defaults.background}
              options={asOptions(draft.lists.backgrounds)}
              onChange={(value) => patchDefault('background', value)}
            />
            <OptionSelect
              id={`${idPrefix}-default-moderation`}
              label="Moderation"
              value={draft.defaults.moderation}
              options={asOptions(draft.lists.moderations)}
              onChange={(value) => patchDefault('moderation', value)}
            />
          </div>
        </Section>

        <Section
          title="Provider features"
          description="Detected by the provider adapter in code. Read-only."
        >
          <FeatureChips features={features} />
        </Section>

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

      <div className="sticky bottom-0 flex justify-end gap-2 rounded-b-xl border-t bg-card/95 px-5 py-3 backdrop-blur">
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
