'use client';

import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/FormAlert';
import { Skeleton } from '@/components/ui/skeleton';

export function SettingsGate({ draft, children }) {
  if (draft.isLoading) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (draft.isError || !draft.settings) {
    return (
      <div className="flex flex-col items-start gap-3">
        <FormAlert>We could not load your settings.</FormAlert>
        <Button variant="secondary" onClick={draft.refetch}>
          Try again
        </Button>
      </div>
    );
  }

  return children;
}
