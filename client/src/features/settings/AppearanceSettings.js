'use client';

import { useState, useSyncExternalStore } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  SettingsCard,
  SettingsSwitchRow,
} from '@/features/settings/SettingsCard';
import { applyAppearance, readAppearance } from '@/lib/theme';
import { cn } from '@/lib/utils';

const THEMES = [
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'system', label: 'System', icon: Monitor },
];

function subscribeToNothing() {
  return () => {};
}

function AppearanceForm() {
  const [saved, setSaved] = useState(readAppearance);
  const [values, setValues] = useState(saved);
  const isDirty =
    values.theme !== saved.theme || values.reduceMotion !== saved.reduceMotion;

  function save() {
    applyAppearance(values);
    setSaved(values);
    toast.success('Appearance saved');
  }

  return (
    <SettingsCard
      title="Appearance"
      description="Saved in this browser only, so each device can look different."
      isDirty={isDirty}
      onSave={save}
      onDiscard={() => setValues(saved)}
    >
      <div
        role="radiogroup"
        aria-label="Theme"
        className="grid grid-cols-3 gap-3"
      >
        {THEMES.map((theme) => (
          <button
            key={theme.value}
            type="button"
            role="radio"
            aria-checked={values.theme === theme.value}
            onClick={() =>
              setValues((current) => ({ ...current, theme: theme.value }))
            }
            className={cn(
              'flex flex-col items-center gap-2 rounded-xl border p-4 text-sm transition-colors hover:bg-accent',
              values.theme === theme.value &&
                'border-brand/60 bg-brand-tint text-brand hover:bg-brand-tint',
            )}
          >
            <theme.icon className="size-5" />
            {theme.label}
          </button>
        ))}
      </div>
      <SettingsSwitchRow
        id="reduce-motion"
        label="Reduce motion"
        description="Turns off animations and transitions."
      >
        <Switch
          id="reduce-motion"
          checked={values.reduceMotion}
          onCheckedChange={(reduceMotion) =>
            setValues((current) => ({ ...current, reduceMotion }))
          }
        />
      </SettingsSwitchRow>
    </SettingsCard>
  );
}

export function AppearanceSettings() {
  const isClient = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );

  return isClient ? <AppearanceForm /> : <Skeleton className="h-64" />;
}
