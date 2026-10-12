'use client';

import { usePathname } from 'next/navigation';
import { BrandMark } from '@/components/layout/BrandMark';
import { CreditPill } from '@/components/layout/navbar/CreditPill';
import { UserMenu } from '@/components/layout/navbar/UserMenu';
import { findBreadcrumb } from '@/constants/navigation';

export function Navbar() {
  const pathname = usePathname();
  const { group, page } = findBreadcrumb(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/85 px-4 backdrop-blur md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <BrandMark className="size-8 md:hidden" />
        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex items-center gap-1.5 text-[13px]">
            <li className="hidden text-muted-foreground sm:block">{group}</li>
            <li aria-hidden="true" className="hidden text-ink-3 sm:block">
              /
            </li>
            <li className="truncate font-medium" aria-current="page">
              {page}
            </li>
          </ol>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <CreditPill />
        <UserMenu />
      </div>
    </header>
  );
}
