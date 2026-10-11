import { cn } from '@/lib/utils';

export function SettingsCard({
  title,
  description,
  footer,
  className,
  children,
}) {
  return (
    <section className={cn('rounded-xl border bg-card', className)}>
      <div className="flex flex-col gap-1 border-b px-5 py-4">
        <h2 className="text-[15px] font-semibold">{title}</h2>
        {description ? (
          <p className="text-[12.5px] text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-5 px-5 py-5">{children}</div>
      {footer ? (
        <div className="flex justify-end border-t px-5 py-3">{footer}</div>
      ) : null}
    </section>
  );
}
