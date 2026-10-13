import { AppShell } from '@/components/layout/AppShell';
import { AuthGuard } from '@/components/layout/AuthGuard';

export default function AdminLayout({ children }) {
  return (
    <AuthGuard adminOnly>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
