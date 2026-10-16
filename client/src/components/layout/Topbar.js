'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { BrandMark } from '@/components/layout/BrandMark';
import { UserAvatar } from '@/components/layout/UserAvatar';
import { Badge } from '@/components/ui/badge';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { CreditBalancePill } from '@/features/credits/CreditBalancePill';
import { NotificationBell } from '@/features/notifications/NotificationBell';
import { findActiveNavItem, getNavGroups } from '@/constants/navigation';

export function Topbar() {
  const pathname = usePathname();
  const user = useSelector(selectCurrentUser);
  const isAdmin = user.role === 'admin';
  const active = findActiveNavItem(getNavGroups({ isAdmin }), pathname);

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur md:px-6 lg:px-8">
      <Link href="/app" className="md:hidden" aria-label="Dashboard">
        <BrandMark className="size-8" />
      </Link>

      <p className="flex min-w-0 flex-1 items-center gap-1.5 text-[13px]">
        <span className="hidden text-ink-3 sm:inline">
          {active?.group.label}
        </span>
        <span className="hidden text-ink-3 sm:inline">/</span>
        <span className="truncate font-medium">{active?.item.label}</span>
      </p>

      <div className="flex items-center gap-2.5">
        <NotificationBell />
        <CreditBalancePill />
        {isAdmin ? (
          <Badge tone="brand" className="hidden sm:inline-flex">
            Admin
          </Badge>
        ) : null}
        <span className="hidden max-w-40 truncate text-[13px] font-medium sm:block">
          {user.name}
        </span>
        <UserAvatar name={user.name} />
      </div>
    </header>
  );
}
