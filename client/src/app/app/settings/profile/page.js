import { ChangeEmailCard } from '@/features/settings/ChangeEmailCard';
import { ProfileSettings } from '@/features/settings/ProfileSettings';

export const metadata = { title: 'Profile' };

export default function ProfileSettingsPage() {
  return (
    <>
      <ProfileSettings />
      <ChangeEmailCard />
    </>
  );
}
