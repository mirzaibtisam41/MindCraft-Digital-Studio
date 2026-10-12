import { AdminGuard } from '@/components/layout/admin/AdminGuard';
import { AdminShell } from '@/components/layout/admin/AdminShell';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { ThemeSync } from '@/features/settings/ThemeSync';

export const metadata = {
  title: {
    default: 'Admin',
    template: '%s · Admin · Mindcraft Digital Studio',
  },
};

export default function AdminLayout({ children }) {
  return (
    <AuthGuard>
      <ThemeSync />
      <AdminGuard>
        <AdminShell>{children}</AdminShell>
      </AdminGuard>
    </AuthGuard>
  );
}
