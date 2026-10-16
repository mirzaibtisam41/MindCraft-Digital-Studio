'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { UserAvatar } from '@/components/layout/UserAvatar';
import { Badge } from '@/components/ui/badge';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/input';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { SettingsCard } from '@/features/settings/SettingsCard';
import { useUpdateProfileMutation } from '@/features/settings/settingsApi';
import { getErrorMessage } from '@/lib/apiError';

export function ProfileSettings() {
  const user = useSelector(selectCurrentUser);
  const [name, setName] = useState(user.name);
  const [errorMessage, setErrorMessage] = useState('');
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const isDirty = name.trim() !== user.name;

  async function save() {
    if (!name.trim()) {
      setErrorMessage('Your name cannot be empty.');
      return;
    }

    setErrorMessage('');

    try {
      const updated = await updateProfile({ name: name.trim() }).unwrap();
      setName(updated.name);
      toast.success('Profile saved');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  return (
    <SettingsCard
      title="Profile"
      description="How you appear in the workspace."
      errorMessage={errorMessage}
      isDirty={isDirty}
      isSaving={isLoading}
      onSave={save}
      onDiscard={() => {
        setName(user.name);
        setErrorMessage('');
      }}
    >
      <div className="flex items-center gap-4">
        <UserAvatar
          name={name.trim() || user.name}
          className="size-14 text-lg"
        />
        <div className="flex flex-col gap-1">
          <span className="font-medium">{user.email}</span>
          <span className="flex items-center gap-2 text-xs text-ink-3">
            <Badge tone={user.role === 'admin' ? 'brand' : 'neutral'}>
              {user.role === 'admin' ? 'Admin' : 'User'}
            </Badge>
            Member since{' '}
            {new Date(user.createdAt).toLocaleDateString(undefined, {
              dateStyle: 'medium',
            })}
          </span>
        </div>
      </div>
      <Field id="profile-name" label="Name">
        <Input
          id="profile-name"
          maxLength={100}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </Field>
      <Field
        id="profile-email"
        label="Email"
        hint="Changing your email needs a verification email, which is coming later."
      >
        <Input id="profile-email" value={user.email} disabled readOnly />
      </Field>
    </SettingsCard>
  );
}
