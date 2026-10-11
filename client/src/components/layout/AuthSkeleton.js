import { Skeleton } from '@/components/ui/skeleton';

export function AuthSkeleton() {
  return (
    <main
      className="flex min-h-dvh items-center justify-center px-4"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="flex w-full max-w-[400px] flex-col gap-6">
        <Skeleton className="mx-auto h-10 w-56" />
        <div className="flex flex-col gap-4 rounded-xl border bg-card p-8">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
    </main>
  );
}
