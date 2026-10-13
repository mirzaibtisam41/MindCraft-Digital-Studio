'use client';

import { StoreProvider } from '@/store/StoreProvider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

export function Providers({ children }) {
  return (
    <StoreProvider>
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster />
    </StoreProvider>
  );
}
