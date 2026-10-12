import { AdminSidebar } from '@/components/layout/admin/AdminSidebar';
import { AdminTopbar } from '@/components/layout/admin/AdminTopbar';

export function AdminShell({ children }) {
  return (
    <div className="flex min-h-dvh">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main
          id="main"
          className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 pb-16 md:px-6 lg:px-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
