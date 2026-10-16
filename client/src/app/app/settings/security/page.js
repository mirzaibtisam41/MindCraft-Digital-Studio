import { ActiveSessionsCard } from '@/features/auth/ActiveSessionsCard';
import { ChangePasswordCard } from '@/features/settings/ChangePasswordCard';

export const metadata = { title: 'Security' };

export default function SecurityPage() {
  return (
    <>
      <ChangePasswordCard />
      <ActiveSessionsCard />
    </>
  );
}
