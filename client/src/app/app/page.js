'use client';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { selectCurrentUser } from '@/features/auth/authSlice';

export default function WorkspacePage() {
  const user = useSelector(selectCurrentUser);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-[22px] font-semibold tracking-tight">
        Welcome, {user.name}
      </h1>
      <p className="text-muted-foreground">
        Your workspace is ready. Image tools will appear here as they are built.
      </p>
      <div className="mt-4">
        <Button asChild variant="outline">
          <Link href="/app/settings/security">Manage your sessions</Link>
        </Button>
      </div>
    </div>
  );
}
