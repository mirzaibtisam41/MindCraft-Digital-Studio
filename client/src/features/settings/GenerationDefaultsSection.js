'use client';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ASPECT_RATIOS } from '@/constants/settings';
import { useSettingsDraft } from '@/hooks/useSettingsDraft';
import { SettingToggle } from '@/features/settings/SettingToggle';
import { SettingsCard } from '@/features/settings/SettingsCard';
import { SettingsGate } from '@/features/settings/SettingsGate';
import { SettingsSaveBar } from '@/features/settings/SettingsSaveBar';

export function GenerationDefaultsSection() {
  const draft = useSettingsDraft();

  return (
    <SettingsGate draft={draft}>
      <div className="flex flex-col gap-4">
        <SettingsSaveBar draft={draft} />
        <SettingsCard
          title="Generation defaults"
          description="Starting values for every new generation. You can still change them per run."
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <p className="font-medium">Default model</p>
              <p className="text-[12.5px] text-muted-foreground">
                You can pick a default once image models are connected.
              </p>
            </div>
            <span className="rounded-full border px-2 text-[11px] leading-5 text-ink-3">
              Soon
            </span>
          </div>

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
