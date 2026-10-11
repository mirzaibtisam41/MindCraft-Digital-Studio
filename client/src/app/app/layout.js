import { AppShell } from '@/components/layout/AppShell';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { ThemeSync } from '@/features/settings/ThemeSync';

export default function AppLayout({ children }) {
  return (
    <AuthGuard>
      <ThemeSync />
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
