'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { UserMenu } from '@/components/layout/navbar/UserMenu';
import {
  ADMIN_NAV_ITEMS,
  findAdminPageLabel,
  isAdminNavItemActive,
} from '@/constants/admin';
import { cn } from '@/lib/utils';

export function AdminTopbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div className="flex h-14 items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <ShieldCheck
            className="size-5 text-brand md:hidden"
            aria-hidden="true"
          />
          <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="flex items-center gap-1.5 text-[13px]">
              <li className="hidden text-muted-foreground sm:block">Admin</li>
              <li aria-hidden="true" className="hidden text-ink-3 sm:block">
                /
              </li>
              <li className="truncate font-medium" aria-current="page">
                {findAdminPageLabel(pathname)}
              </li>
            </ol>
          </nav>
        </div>
        <UserMenu />
      </div>
      <nav
        aria-label="Admin sections"
        className="flex gap-1 overflow-x-auto border-t px-3 py-2 md:hidden"
      >
        {ADMIN_NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={
              isAdminNavItemActive(item, pathname) ? 'page' : undefined
            }
            className={cn(
              'shrink-0 rounded-full border border-transparent px-3 py-1 text-[12.5px]',
              isAdminNavItemActive(item, pathname)
                ? 'border-brand/30 bg-brand-tint text-foreground'
                : 'text-muted-foreground',
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
