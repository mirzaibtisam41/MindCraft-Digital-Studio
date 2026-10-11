import { BrandMark } from '@/components/layout/BrandMark';

export function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[radial-gradient(60%_50%_at_50%_0%,var(--brand-tint),transparent)] px-4 py-10">
      <div className="flex w-full max-w-[400px] flex-col gap-6">
        <div className="flex items-center justify-center gap-3">
          <BrandMark className="size-10" />
          <div className="leading-tight">
            <p className="text-[15px] font-semibold">
              Mindcraft Digital Studio
            </p>
            <p className="text-xs text-ink-3">Creative workspace</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-xl sm:p-8">
          <div className="mb-6 flex flex-col gap-1">
            <h1 className="text-[22px] font-semibold tracking-tight">
              {title}
            </h1>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>

        {footer ? (
          <p className="text-center text-muted-foreground [&_a]:font-medium [&_a]:text-brand [&_a]:underline-offset-4 [&_a:hover]:underline">
            {footer}
          </p>
        ) : null}
      </div>
    </main>
  );
}
