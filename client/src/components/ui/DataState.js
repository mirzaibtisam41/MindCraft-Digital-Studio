import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/FormAlert';
import { Skeleton } from '@/components/ui/skeleton';
import { getErrorMessage } from '@/lib/apiError';

export function TableSkeleton({ rows = 6 }) {
  return (
    <div className="flex flex-col gap-2 p-3" aria-busy="true">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-start gap-3 p-4">
      <FormAlert>{getErrorMessage(error)}</FormAlert>
      {onRetry ? (
        <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-12 text-center">
      <p className="font-medium">{title}</p>
      {description ? (
        <p className="text-[12.5px] text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
