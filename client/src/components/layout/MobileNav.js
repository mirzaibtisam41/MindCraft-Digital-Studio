'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { getNavGroups, isNavItemActive } from '@/constants/navigation';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const pathname = usePathname();
  const user = useSelector(selectCurrentUser);
  const readyItems = getNavGroups({ isAdmin: user.role === 'admin' })
    .flatMap((group) => group.items)
    .filter((item) => item.ready);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-sidebar pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {readyItems.map((item) => {
        const Icon = item.icon;
        const active = isNavItemActive(item, pathname);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px]',
              active ? 'text-brand' : 'text-muted-foreground',
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
