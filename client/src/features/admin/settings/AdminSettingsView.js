'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/DataState';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/Spinner';
import { SettingsCard } from '@/features/settings/SettingsCard';
import {
  useGetAdminSettingsQuery,
  useUpdateAdminSettingsMutation,
} from '@/features/admin/adminApi';
import { getErrorMessage } from '@/lib/apiError';

const SIGNUP_CREDITS_MAX = 10000;

function SettingsForm({ settings }) {
  const [updateSettings, { isLoading }] = useUpdateAdminSettingsMutation();
  const [signupCredits, setSignupCredits] = useState(
    String(settings.signupCredits),
  );
  const [error, setError] = useState('');

  const parsed = Number(signupCredits);
  const isValid =
    signupCredits.trim() !== '' &&
    Number.isInteger(parsed) &&
    parsed >= 0 &&
    parsed <= SIGNUP_CREDITS_MAX;
  const isDirty = isValid && parsed !== settings.signupCredits;

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isValid) {
      setError(`Enter a whole number between 0 and ${SIGNUP_CREDITS_MAX}.`);

      return;
    }

    setError('');

    try {
      await updateSettings({ signupCredits: parsed }).unwrap();
      toast.success('Settings saved');
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <SettingsCard
        title="Signup credits"
        description="Credits granted to every new account at registration. Existing users are not affected."
        footer={
          <Button type="submit" disabled={!isDirty || isLoading}>
            {isLoading ? <Spinner /> : null}
            Save changes
          </Button>
        }
      >
        <Field
          id="signup-credits"
          label="Credits per new account"
          error={error}
          hint="Set to 0 to stop granting credits at signup."
          className="max-w-xs"
        >
          <Input
            id="signup-credits"
            type="number"
            inputMode="numeric"
            min={0}
            max={SIGNUP_CREDITS_MAX}
            className="h-10 font-mono"
            placeholder="60"
            value={signupCredits}
            onChange={(event) => setSignupCredits(event.target.value)}
            aria-invalid={Boolean(error)}
          />
        </Field>
      </SettingsCard>
    </form>
  );
}

export function AdminSettingsView() {
  const { data, isLoading, error, refetch } = useGetAdminSettingsQuery();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Workspace-wide values that apply to everyone."
      />
      {error ? <ErrorState error={error} onRetry={refetch} /> : null}
      {isLoading ? <Skeleton className="h-52 w-full" /> : null}
      {data ? <SettingsForm key={data.signupCredits} settings={data} /> : null}
    </div>
  );
}
