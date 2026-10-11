'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandMark } from '@/components/layout/BrandMark';
import { NavItem } from '@/components/layout/sidebar/NavItem';
import { NAV_GROUPS, isNavItemActive } from '@/constants/navigation';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-16 shrink-0 flex-col border-r bg-sidebar md:flex lg:w-60">
      <Link
        href="/app"
        className="flex h-14 items-center gap-3 border-b px-3.5 lg:px-4"
        aria-label="Mindcraft Digital Studio, dashboard"
      >
        <BrandMark />
        <span className="hidden leading-tight lg:block">
          <span className="block text-[13.5px] font-semibold">
            Mindcraft Digital Studio
          </span>
          <span className="block text-[11px] text-ink-3">
            Creative workspace
          </span>
        </span>
      </Link>

      <nav
        aria-label="Main"
        className="flex flex-1 flex-col gap-5 overflow-y-auto px-2 py-4 lg:px-3"
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            <p className="hidden px-3 pb-1 text-[10.5px] font-semibold tracking-wider text-ink-3 uppercase lg:block">
              {group.label}
            </p>
            <div
              aria-hidden="true"
              className="mx-2 mb-1 h-px bg-border first:hidden lg:hidden"
            />
            {group.items.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                active={isNavItemActive(item, pathname)}
              />
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
