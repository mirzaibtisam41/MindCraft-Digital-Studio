import { Skeleton } from '@/components/ui/skeleton';

export function AppShellSkeleton() {
  return (
    <div className="flex min-h-dvh" aria-busy="true" aria-label="Loading">
      <aside className="hidden w-16 shrink-0 flex-col gap-3 border-r bg-sidebar p-3 md:flex lg:w-60 lg:p-4">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="mt-4 h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center justify-between border-b px-4 md:px-6">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="size-8 rounded-full" />
        </div>
        <div className="flex flex-col gap-4 p-4 md:p-8">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80 max-w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}
