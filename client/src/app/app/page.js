import { AccountCard } from '@/features/dashboard/AccountCard';
import { GreetingHeader } from '@/features/dashboard/GreetingHeader';
import { UpcomingTools } from '@/features/dashboard/UpcomingTools';

export const metadata = { title: 'Dashboard' };

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <GreetingHeader />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <UpcomingTools />
        <AccountCard />
      </div>
    </div>
  );
}
