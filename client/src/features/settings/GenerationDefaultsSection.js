'use client';

import { Field } from '@/components/ui/Field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ASPECT_RATIOS } from '@/constants/settings';
import { useSettingsDraft } from '@/hooks/useSettingsDraft';
import { useGetImageOptionsQuery } from '@/features/generator/generatorApi';
import { SettingToggle } from '@/features/settings/SettingToggle';
import { SettingsCard } from '@/features/settings/SettingsCard';
import { SettingsGate } from '@/features/settings/SettingsGate';
import { SettingsSaveBar } from '@/features/settings/SettingsSaveBar';

const WORKSPACE_DEFAULT = 'workspace-default';

export function GenerationDefaultsSection() {
  const draft = useSettingsDraft();
  const { data: options } = useGetImageOptionsQuery();
  const models = options?.models;

  return (
    <SettingsGate draft={draft}>
      <div className="flex flex-col gap-4">
        <SettingsSaveBar draft={draft} />
        <SettingsCard
          title="Generation defaults"
          description="Starting values for every new generation. You can still change them per run."
        >
          <Field
            id="default-model"
            label="Default model"
            hint="Used when you do not pick a model for a run."
          >
            <Select
              value={draft.settings?.defaultModel ?? WORKSPACE_DEFAULT}
              disabled={!models}
              onValueChange={(value) =>
                draft.change(
                  'defaultModel',
                  value === WORKSPACE_DEFAULT ? null : value,
                )
              }
            >
              <SelectTrigger id="default-model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={WORKSPACE_DEFAULT}>
                  Workspace default
                </SelectItem>
                {models?.map(({ id, label }) => (
                  <SelectItem key={id} value={id}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="flex flex-col gap-2">
            <p id="aspect-ratio-label" className="font-medium">
              Default aspect ratio
            </p>
            <ToggleGroup
              type="single"
              variant="outline"
              aria-labelledby="aspect-ratio-label"
              value={draft.settings?.defaultAspectRatio}
              onValueChange={(value) => {
                if (value) draft.change('defaultAspectRatio', value);
              }}
              className="flex-wrap"
            >
              {ASPECT_RATIOS.map((ratio) => (
                <ToggleGroupItem
                  key={ratio}
                  value={ratio}
                  className="min-w-16 font-mono text-xs data-[state=on]:border-brand/40 data-[state=on]:bg-brand-tint data-[state=on]:text-foreground"
                >
                  {ratio}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <SettingToggle
            id="auto-enhance-prompts"
            label="Auto-enhance prompts"
            description="Add missing detail to your prompt before generating. Your idea is never rewritten."
            checked={Boolean(draft.settings?.autoEnhancePrompts)}
            onChange={(value) => draft.change('autoEnhancePrompts', value)}
          />

          <SettingToggle
            id="save-originals"
            label="Save originals with edits"
            description="Keep the untouched original next to every edited image."
            checked={Boolean(draft.settings?.saveOriginalsWithEdits)}
            onChange={(value) => draft.change('saveOriginalsWithEdits', value)}
          />
        </SettingsCard>
      </div>
    </SettingsGate>
  );
}
