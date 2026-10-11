'use client';

import { NOTIFICATION_OPTIONS } from '@/constants/settings';
import { useSettingsDraft } from '@/hooks/useSettingsDraft';
import { SettingToggle } from '@/features/settings/SettingToggle';
import { SettingsCard } from '@/features/settings/SettingsCard';
import { SettingsGate } from '@/features/settings/SettingsGate';
import { SettingsSaveBar } from '@/features/settings/SettingsSaveBar';

export function NotificationsSection() {
  const draft = useSettingsDraft();

  return (
    <SettingsGate draft={draft}>
      <div className="flex flex-col gap-4">
        <SettingsSaveBar draft={draft} />
        <SettingsCard
          title="Notifications"
          description="Your choices are saved now and apply as soon as notifications launch."
        >
          {NOTIFICATION_OPTIONS.map((option) => (
            <SettingToggle
              key={option.key}
              id={option.key}
              label={option.label}
              description={option.description}
              checked={Boolean(draft.settings?.[option.key])}
              onChange={(value) => draft.change(option.key, value)}
            />
          ))}
        </SettingsCard>
      </div>
    </SettingsGate>
  );
}
