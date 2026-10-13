import { Spinner } from '@/components/ui/Spinner';

export function PageLoader() {
  return (
    <main
      className="flex min-h-dvh items-center justify-center"
      aria-busy="true"
      aria-label="Loading"
    >
      <Spinner className="size-6 text-ink-3" />
    </main>
  );
}
