import { Spinner } from '@/components/ui/Spinner';

export function GeneratingCard({ count, model }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-3 rounded-xl border bg-card px-6 py-14 text-center"
    >
      <Spinner className="size-6 text-brand" />
      <div className="flex flex-col gap-1">
        <p className="font-medium">
          Generating {count} {count === 1 ? 'image' : 'images'}…
        </p>
        <p className="text-[12.5px] text-muted-foreground">
          {model.label} does not report progress. This can take up to a minute.
        </p>
      </div>
    </div>
  );
}
