'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useGetProfileQuery } from '@/features/auth/authApi';
import { getGreeting } from '@/lib/greeting';

export function GreetingHeader() {
  const { data: user } = useGetProfileQuery();

  if (!user) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-56" />
      </div>
    );
  }

  const firstName = user.name.split(/\s+/)[0];

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-[30px] leading-tight font-[650] tracking-[-0.025em]">
        {getGreeting()}, {firstName}
      </h1>
      <p className="text-muted-foreground">
        Your workspace is ready. Image tools will appear here as they launch.
      </p>
    </div>
  );
}
