import { MobileTabBar } from '@/components/layout/MobileTabBar';
import { Navbar } from '@/components/layout/navbar/Navbar';
import { Sidebar } from '@/components/layout/sidebar/Sidebar';

export function AppShell({ children }) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main
          id="main"
          className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-24 md:px-6 md:pb-10 lg:px-8"
        >
          {children}
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
}
