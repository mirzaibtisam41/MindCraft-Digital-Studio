'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const SETTINGS_PAGES = [
  { label: 'Profile', href: '/app/settings/profile' },
  { label: 'Generation defaults', href: '/app/settings/generation' },
  { label: 'Notifications', href: '/app/settings/notifications' },
  { label: 'Security', href: '/app/settings/security' },
  { label: 'Appearance', href: '/app/settings/appearance' },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Settings"
      className="-mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0"
    >
      {SETTINGS_PAGES.map((page) => (
        <Link
          key={page.href}
          href={page.href}
          aria-current={pathname === page.href ? 'page' : undefined}
          className={cn(
            'shrink-0 rounded-lg px-3 py-2 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
            pathname === page.href &&
              'bg-brand-tint text-brand hover:bg-brand-tint hover:text-brand',
          )}
        >
          {page.label}
        </Link>
      ))}
    </nav>
  );
}
