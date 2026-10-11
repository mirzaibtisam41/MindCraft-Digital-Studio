import { SettingsNav } from '@/features/settings/SettingsNav';

export const metadata = { title: 'Settings' };

export default function SettingsLayout({ children }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-[22px] font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile, defaults and how the workspace looks.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_minmax(0,1fr)] lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="min-w-0">
          <SettingsNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
