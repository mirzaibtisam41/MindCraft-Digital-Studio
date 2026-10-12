import { ImageIcon } from 'lucide-react';

export function EmptyResults() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card/50 px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-brand-tint text-brand">
        <ImageIcon className="size-6" aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-medium">Nothing generated yet</p>
        <p className="text-[12.5px] text-muted-foreground">
          Write a prompt, pick your options and press Generate. Your images show
          up here.
        </p>
      </div>
    </div>
  );
}
