import Link from 'next/link';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFoundView({ homeHref = '/', homeLabel = 'Go home' }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-brand-tint text-brand">
        <Compass className="size-6" aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-1">
        <h1 className="text-[22px] font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="text-muted-foreground">
          The page you are looking for does not exist or has moved.
        </p>
      </div>
      <Button asChild>
        <Link href={homeHref}>{homeLabel}</Link>
      </Button>
    </div>
  );
}
