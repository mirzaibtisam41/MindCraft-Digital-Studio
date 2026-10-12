'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { NavItem } from '@/components/layout/sidebar/NavItem';
import { ADMIN_NAV_ITEMS, isAdminNavItemActive } from '@/constants/admin';

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-16 shrink-0 flex-col border-r bg-sidebar md:flex lg:w-60">
      <Link
        href="/admin"
        className="flex h-14 items-center gap-3 border-b px-3.5 lg:px-4"
        aria-label="Admin console, overview"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-b from-brand-from to-brand-to text-white">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </span>
        <span className="hidden leading-tight lg:block">
          <span className="block text-[13.5px] font-semibold">
            Admin console
          </span>
          <span className="block text-[11px] text-ink-3">
            Mindcraft Digital Studio
          </span>
        </span>
      </Link>

      <nav
        aria-label="Admin"
        className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-4 lg:px-3"
      >
        {ADMIN_NAV_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            active={isAdminNavItemActive(item, pathname)}
          />
        ))}
      </nav>

      <div className="border-t px-2 py-3 lg:px-3">
        <Link
          href="/app"
          title="Back to app"
          className="flex h-9 items-center gap-3 rounded-lg px-2.5 text-[13.5px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground max-lg:justify-center lg:px-3"
        >
          <ArrowLeft className="size-[18px] shrink-0" aria-hidden="true" />
          <span className="hidden lg:inline">Back to app</span>
        </Link>
      </div>
    </aside>
  );
}
