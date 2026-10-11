'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { THEME_OPTIONS } from '@/constants/settings';
import { useSettingsDraft } from '@/hooks/useSettingsDraft';
import { SettingToggle } from '@/features/settings/SettingToggle';
import { SettingsCard } from '@/features/settings/SettingsCard';
import { SettingsGate } from '@/features/settings/SettingsGate';
import { SettingsSaveBar } from '@/features/settings/SettingsSaveBar';

const THEME_ICONS = { dark: Moon, light: Sun, system: Monitor };

export function AppearanceSection() {
  const draft = useSettingsDraft();

  return (
    <SettingsGate draft={draft}>
      <div className="flex flex-col gap-4">
        <SettingsSaveBar draft={draft} />
        <SettingsCard
          title="Appearance"
          description="Changes preview right away. Save to keep them on this account."
        >
          <div className="flex flex-col gap-2">
            <p id="theme-label" className="font-medium">
              Theme
            </p>
            <ToggleGroup
              type="single"
              variant="outline"
              aria-labelledby="theme-label"
              value={draft.settings?.theme}
              onValueChange={(value) => {
                if (value) draft.change('theme', value);
              }}
              className="grid w-full grid-cols-3"
            >
              {THEME_OPTIONS.map(({ value, label }) => {
                const Icon = THEME_ICONS[value];

                return (
                  <ToggleGroupItem
                    key={value}
                    value={value}
                    className="h-20 flex-col gap-2 data-[state=on]:border-brand/40 data-[state=on]:bg-brand-tint data-[state=on]:text-foreground"
                  >
                    <Icon className="size-5" aria-hidden="true" />
                    {label}
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
          </div>

          <SettingToggle
            id="reduce-motion"
            label="Reduce motion"
            description="Turn off fades and movement across the workspace."
            checked={Boolean(draft.settings?.reduceMotion)}
            onChange={(value) => draft.change('reduceMotion', value)}
          />
        </SettingsCard>
      </div>
    </SettingsGate>
  );
}
