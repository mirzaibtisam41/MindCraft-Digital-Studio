'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { LogOut } from 'lucide-react';
import { BrandMark } from '@/components/layout/BrandMark';
import { UserAvatar } from '@/components/layout/UserAvatar';
import { Button } from '@/components/ui/button';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { LogoutConfirmDialog } from '@/features/auth/LogoutConfirmDialog';
import { getNavGroups, isNavItemActive } from '@/constants/navigation';
import { cn } from '@/lib/utils';

const ITEM_CLASSES =
  'flex h-9 items-center gap-3 rounded-lg border border-transparent px-2.5 text-[13.5px] transition-colors lg:px-3 max-lg:justify-center';

function NavItem({ item, active }) {
  const Icon = item.icon;

  const content = (
    <>
      <Icon className="size-[18px] shrink-0" aria-hidden="true" />
      <span className="hidden truncate lg:inline">{item.label}</span>
      {item.ready ? null : (
        <span className="ml-auto hidden rounded-full border px-1.5 text-[10px] leading-4 text-ink-3 lg:inline">
          Soon
        </span>
      )}
    </>
  );

  if (!item.ready) {
    return (
      <span
        aria-disabled="true"
        title={`${item.label} (coming soon)`}
        className={cn(ITEM_CLASSES, 'cursor-not-allowed text-ink-3 opacity-60')}
      >
        {content}
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      title={item.label}
      aria-current={active ? 'page' : undefined}
      className={cn(
        ITEM_CLASSES,
        active
          ? 'border-brand/30 bg-brand-tint text-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
    >
      {content}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const user = useSelector(selectCurrentUser);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const navGroups = getNavGroups({ isAdmin: user.role === 'admin' });

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
        {navGroups.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            <p className="hidden px-3 pb-1 text-[10.5px] font-semibold tracking-wider text-ink-3 uppercase lg:block">
              {group.label}
            </p>
            {group.items.map((item) => (
              <NavItem
                key={item.label}
                item={item}
                active={isNavItemActive(item, pathname)}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-2.5 border-t p-3 max-lg:flex-col">
        <UserAvatar name={user.name} />
        <div className="hidden min-w-0 flex-1 leading-tight lg:block">
          <p className="truncate text-[13px] font-medium">{user.name}</p>
          <p className="truncate text-[11px] text-ink-3">{user.email}</p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Log out"
          title="Log out"
          onClick={() => setIsLogoutOpen(true)}
        >
          <LogOut />
        </Button>
      </div>

      <LogoutConfirmDialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen} />
    </aside>
  );
}
