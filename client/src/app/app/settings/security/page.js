import { ActiveSessionsCard } from '@/features/auth/ActiveSessionsCard';
import { ProfileCard } from '@/features/auth/ProfileCard';

export const metadata = { title: 'Security' };

export default function SecurityPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-[22px] font-semibold tracking-tight">Security</h1>
        <p className="text-muted-foreground">
          Your account details and the devices you are logged in on.
        </p>
      </div>
      <ProfileCard />
      <ActiveSessionsCard />
    </div>
  );
}
