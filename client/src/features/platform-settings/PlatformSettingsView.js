'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field } from '@/components/ui/Field';
import { FormAlert } from '@/components/ui/FormAlert';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/Spinner';
import {
  useGetPlatformSettingsQuery,
  useUpdatePlatformSettingsMutation,
} from '@/features/platform-settings/platformSettingsApi';
import { getErrorMessage } from '@/lib/apiError';

const SIGNUP_CREDITS_MAX = 10000;

function SignupCreditsForm({ settings }) {
  const [signupCredits, setSignupCredits] = useState(
    String(settings.signupCredits),
  );
  const [fieldError, setFieldError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [updatePlatformSettings, { isLoading }] =
    useUpdatePlatformSettingsMutation();

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');

    const value = Number(signupCredits);
    const isValid = /^\d+$/.test(signupCredits) && value <= SIGNUP_CREDITS_MAX;

    setFieldError(
      isValid ? '' : `Use a whole number from 0 to ${SIGNUP_CREDITS_MAX}.`,
    );

    if (!isValid) return;

    try {
      await updatePlatformSettings({ signupCredits: value }).unwrap();
      toast.success('Settings saved');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Signup credits</CardTitle>
          <CardDescription>
            Free credits every new account receives. Changing this does not
            affect accounts that already exist.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FormAlert>{errorMessage}</FormAlert>
          <Field
            id="signup-credits"
            label="Credits for a new account"
            error={fieldError}
            hint="Set 0 to give no free credits."
            className="sm:max-w-60"
          >
            <Input
              id="signup-credits"
              type="number"
              min="0"
              value={signupCredits}
              onChange={(event) => setSignupCredits(event.target.value)}
              aria-invalid={Boolean(fieldError)}
            />
          </Field>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Spinner /> : null}
            Save settings
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

export function PlatformSettingsView() {
  const { data: settings, isLoading, error } = useGetPlatformSettingsQuery();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-[22px] font-semibold tracking-tight">
          Platform settings
        </h1>
        <p className="text-muted-foreground">
          Settings that apply to the whole platform.
        </p>
      </div>

      {error ? <FormAlert>{getErrorMessage(error)}</FormAlert> : null}
      {isLoading ? <Skeleton className="h-48 w-full" /> : null}
      {settings ? (
        <SignupCreditsForm key={settings.signupCredits} settings={settings} />
      ) : null}
    </div>
  );
}
