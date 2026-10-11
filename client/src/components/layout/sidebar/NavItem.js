import Link from 'next/link';
import { cn } from '@/lib/utils';

const BASE_CLASSES =
  'flex h-9 items-center gap-3 rounded-lg border border-transparent px-2.5 text-[13.5px] transition-colors lg:px-3 max-lg:justify-center';

export function NavItem({ item, active }) {
  const { Icon, label, href, ready } = { ...item, Icon: item.icon };

  const content = (
    <>
      <Icon className="size-[18px] shrink-0" aria-hidden="true" />
      <span className="hidden truncate lg:inline">{label}</span>
      {ready ? null : (
        <span className="ml-auto hidden rounded-full border px-1.5 text-[10px] leading-4 text-ink-3 lg:inline">
          Soon
        </span>
      )}
    </>
  );

  if (!ready) {
    return (
      <span
        aria-disabled="true"
        title={`${label} (coming soon)`}
        className={cn(BASE_CLASSES, 'cursor-not-allowed text-ink-3 opacity-60')}
      >
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      title={label}
      aria-current={active ? 'page' : undefined}
      className={cn(
        BASE_CLASSES,
        active
          ? 'border-brand/30 bg-brand-tint text-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
    >
      {content}
    </Link>
  );
}
