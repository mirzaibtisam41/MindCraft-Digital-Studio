'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/Field';
import { FormAlert } from '@/components/ui/FormAlert';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/Spinner';
import { NAME_MAX_LENGTH } from '@/constants/formLimits';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from '@/features/auth/authApi';
import { SettingsCard } from '@/features/settings/SettingsCard';
import { getErrorMessage, readFieldErrors } from '@/lib/apiError';
import { formatDate } from '@/lib/formatDate';
import { getInitials } from '@/lib/getInitials';
import { validateName } from '@/lib/validators';

function ProfileForm({ user }) {
  const [name, setName] = useState(user.name);
  const [nameError, setNameError] = useState('');
  const [formError, setFormError] = useState('');
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const isUnchanged = name.trim() === user.name;

  async function handleSubmit(event) {
    event.preventDefault();

    const error = validateName(name);

    setNameError(error);
    setFormError('');

    if (error) return;

    try {
      const updated = await updateProfile({ name: name.trim() }).unwrap();

      setName(updated.name);
      toast.success('Profile updated');
    } catch (requestError) {
      setNameError(readFieldErrors(requestError).name ?? '');
      setFormError(getErrorMessage(requestError));
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <SettingsCard
        title="Profile"
        description="How you appear across the workspace."
        footer={
          <Button type="submit" size="sm" disabled={isLoading || isUnchanged}>
            {isLoading ? <Spinner /> : null}
            {isLoading ? 'Saving…' : 'Save profile'}
          </Button>
        }
      >
        <FormAlert>{formError}</FormAlert>

        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="bg-brand-tint text-lg font-semibold text-brand">
              {getInitials(name || user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold">{user.name}</p>
            <p className="font-mono text-xs text-ink-3">
              Member since {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        <Field id="profile-name" label="Name" error={nameError}>
          <Input
            id="profile-name"
            name="name"
            autoComplete="name"
            maxLength={NAME_MAX_LENGTH}
            className="h-10"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setNameError('');
            }}
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? 'profile-name-error' : undefined}
          />
        </Field>

        <Field
          id="profile-email"
          label="Email"
          hint="Changing your email is not available yet."
        >
          <Input
            id="profile-email"
            type="email"
            className="h-10"
            value={user.email}
            readOnly
            disabled
            aria-describedby="profile-email-hint"
          />
        </Field>
      </SettingsCard>
    </form>
  );
}

export function ProfileSection() {
  const { data: user } = useGetProfileQuery();

  if (!user) return <Skeleton className="h-80 w-full" />;

  return <ProfileForm key={user.id} user={user} />;
}
