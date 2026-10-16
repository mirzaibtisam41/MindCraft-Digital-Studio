'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { LogOut } from 'lucide-react';
import { UserAvatar } from '@/components/layout/UserAvatar';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { LogoutConfirmDialog } from '@/features/auth/LogoutConfirmDialog';
import { getMobileTabs, isNavItemActive } from '@/constants/navigation';
import { cn } from '@/lib/utils';

const TAB_CLASSES =
  'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px]';

function isTabActive(tab, pathname) {
  if (tab.href) return isNavItemActive(tab, pathname);

  return [...tab.items, ...(tab.adminItems ?? [])].some((item) =>
    isNavItemActive(item, pathname),
  );
}

function SheetLink({ item, pathname, onNavigate }) {
  const Icon = item.icon;
  const active = isNavItemActive(item, pathname);

  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-accent',
        active && 'bg-brand-tint text-brand',
      )}
    >
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      {item.label}
    </Link>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const user = useSelector(selectCurrentUser);
  const [openTabLabel, setOpenTabLabel] = useState(null);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const tabs = getMobileTabs({ isAdmin: user.role === 'admin' });
  const openTab = tabs.find((tab) => tab.label === openTabLabel) ?? null;

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-sidebar pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isTabActive(tab, pathname);
          const className = cn(
            TAB_CLASSES,
            active ? 'text-brand' : 'text-muted-foreground',
          );

          return tab.href ? (
            <Link
              key={tab.label}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={className}
            >
              <Icon className="size-5" aria-hidden="true" />
              {tab.label}
            </Link>
          ) : (
            <button
              key={tab.label}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={openTabLabel === tab.label}
              onClick={() => setOpenTabLabel(tab.label)}
              className={className}
            >
              <Icon className="size-5" aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <Sheet
        open={Boolean(openTab)}
        onOpenChange={(open) => {
          if (!open) setOpenTabLabel(null);
        }}
      >
        <SheetContent
          side="bottom"
          className="max-h-[80dvh] gap-0 rounded-t-2xl pb-[env(safe-area-inset-bottom)]"
        >
          <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-muted" />
          <SheetHeader className="pb-2">
            <SheetTitle>{openTab?.label}</SheetTitle>
            <SheetDescription className="sr-only">
              Pages in {openTab?.label}
            </SheetDescription>
          </SheetHeader>
          {openTab?.label === 'Account' ? (
            <div className="mx-4 mb-2 flex items-center gap-3 rounded-xl border p-3">
              <UserAvatar name={user.name} />
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-ink-3">{user.email}</p>
              </div>
            </div>
          ) : null}
          <nav
            aria-label={openTab?.label}
            className="flex flex-col gap-1 overflow-y-auto px-2 pb-4"
          >
            {openTab?.items.map((item) => (
              <SheetLink
                key={item.href}
                item={item}
                pathname={pathname}
                onNavigate={() => setOpenTabLabel(null)}
              />
            ))}
            {openTab?.adminItems?.length ? (
              <>
                <p className="px-3 pt-3 pb-1 text-[10.5px] font-semibold tracking-wider text-ink-3 uppercase">
                  Admin
                </p>
                {openTab.adminItems.map((item) => (
                  <SheetLink
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    onNavigate={() => setOpenTabLabel(null)}
                  />
                ))}
              </>
            ) : null}
            {openTab?.label === 'Account' ? (
              <button
                type="button"
                onClick={() => {
                  setOpenTabLabel(null);
                  setIsLogoutOpen(true);
                }}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-danger transition-colors hover:bg-accent"
              >
                <LogOut className="size-5 shrink-0" aria-hidden="true" />
                Log out
              </button>
            ) : null}
          </nav>
        </SheetContent>
      </Sheet>

      <LogoutConfirmDialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen} />
    </>
  );
}
