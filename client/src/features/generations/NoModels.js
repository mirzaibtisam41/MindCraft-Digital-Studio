import { ImagePlus } from 'lucide-react';

export function NoModels({
  message = 'An admin needs to turn on a model before you can use this.',
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
      <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <ImagePlus className="size-5" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-medium">No image models are available yet</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
