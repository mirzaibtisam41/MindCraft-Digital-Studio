import { ImagePlus, PenTool, ScanEye } from 'lucide-react';

const TOOLS = [
  {
    title: 'Image Editor',
    description: 'Mask a region and edit it with a plain instruction.',
    icon: PenTool,
  },
  {
    title: 'Image to Image',
    description: 'Transform a reference image into new variations.',
    icon: ImagePlus,
  },
  {
    title: 'AI Vision',
    description: 'Describe, caption and extract text from any image.',
    icon: ScanEye,
  },
];

export function UpcomingTools() {
  return (
    <section aria-labelledby="tools-heading" className="flex flex-col gap-3">
      <h2
        id="tools-heading"
        className="text-[10.5px] font-semibold tracking-wider text-ink-3 uppercase"
      >
        Coming next
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {TOOLS.map(({ title, description, icon: Icon }) => (
          <li
            key={title}
            className="flex gap-3 rounded-xl border border-dashed bg-card/50 p-4"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand">
              <Icon className="size-[18px]" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-medium">
                {title}
                <span className="rounded-full border px-1.5 text-[10px] leading-4 text-ink-3">
                  Soon
                </span>
              </p>
              <p className="text-[12.5px] text-muted-foreground">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
