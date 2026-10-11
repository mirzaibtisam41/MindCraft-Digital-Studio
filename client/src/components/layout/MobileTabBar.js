'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MOBILE_TABS, isNavItemActive } from '@/constants/navigation';
import { cn } from '@/lib/utils';

const TAB_CLASSES =
  'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px]';

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-sidebar pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {MOBILE_TABS.map((tab) => {
        const Icon = tab.icon;
        const active = isNavItemActive(tab, pathname);

        if (!tab.ready) {
          return (
            <span
              key={tab.label}
              aria-disabled="true"
              className={cn(
                TAB_CLASSES,
                'cursor-not-allowed text-ink-3 opacity-50',
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {tab.label}
            </span>
          );
        }

        return (
          <Link
            key={tab.label}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              TAB_CLASSES,
              active ? 'text-brand' : 'text-muted-foreground',
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
