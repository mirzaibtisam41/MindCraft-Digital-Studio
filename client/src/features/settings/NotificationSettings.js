'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  SettingsCard,
  SettingsSwitchRow,
} from '@/features/settings/SettingsCard';
import {
  useGetMySettingsQuery,
  useUpdateMySettingsMutation,
} from '@/features/settings/settingsApi';
import { getErrorMessage } from '@/lib/apiError';

const SWITCHES = [
  {
    field: 'notifyGenerationFailed',
    label: 'Failed generations',
    description:
      'When a generation or an analysis fails and its credits come back.',
  },
  {
    field: 'notifyCreditChanges',
    label: 'Credit changes',
    description: 'When an admin adds credits to or removes them from you.',
  },
  {
    field: 'notifyLowCredits',
    label: 'Low credit warning',
    description: 'Once, when your balance goes below the amount below.',
  },
];

function NotificationForm({ settings }) {
  const saved = {
    notifyGenerationFailed: settings.notifyGenerationFailed,
    notifyCreditChanges: settings.notifyCreditChanges,
    notifyLowCredits: settings.notifyLowCredits,
    lowCreditThreshold: String(settings.lowCreditThreshold),
  };
  const [values, setValues] = useState(saved);
  const [fieldError, setFieldError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [updateMySettings, { isLoading }] = useUpdateMySettingsMutation();
  const isDirty = Object.keys(saved).some((key) => values[key] !== saved[key]);

  async function save() {
    const threshold = Number(values.lowCreditThreshold);

    if (!Number.isInteger(threshold) || threshold < 1 || threshold > 100000) {
      setFieldError('Use a whole number from 1 to 100,000.');
      return;
    }

    setFieldError('');
    setErrorMessage('');

    try {
      await updateMySettings({
        notifyGenerationFailed: values.notifyGenerationFailed,
        notifyCreditChanges: values.notifyCreditChanges,
        notifyLowCredits: values.notifyLowCredits,
        lowCreditThreshold: threshold,
      }).unwrap();
      toast.success('Notification settings saved');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  return (
    <SettingsCard
      title="Notifications"
      description="Choose what shows up under the bell in the top bar."
      errorMessage={errorMessage}
      isDirty={isDirty}
      isSaving={isLoading}
      onSave={save}
      onDiscard={() => {
        setValues(saved);
        setFieldError('');
        setErrorMessage('');
      }}
    >
      {SWITCHES.map((item) => (
        <SettingsSwitchRow
          key={item.field}
          id={item.field}
          label={item.label}
          description={item.description}
        >
          <Switch
            id={item.field}
            checked={values[item.field]}
            onCheckedChange={(checked) =>
              setValues((current) => ({ ...current, [item.field]: checked }))
            }
          />
        </SettingsSwitchRow>
      ))}
      <Field
        id="low-credit-threshold"
        label="Warn me below"
        error={fieldError}
        hint="credits"
        className="max-w-48"
      >
        <Input
          id="low-credit-threshold"
          type="number"
          min={1}
          max={100000}
          disabled={!values.notifyLowCredits}
          value={values.lowCreditThreshold}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              lowCreditThreshold: event.target.value,
            }))
          }
        />
      </Field>
    </SettingsCard>
  );
}

export function NotificationSettings() {
  const { data, error } = useGetMySettingsQuery();

  if (error) {
    return <p className="text-sm text-danger">{getErrorMessage(error)}</p>;
  }

  if (!data) return <Skeleton className="h-72" />;

  return <NotificationForm settings={data} />;
}
