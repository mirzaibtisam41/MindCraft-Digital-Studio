import { SettingsNav } from '@/features/settings/SettingsNav';

export default function SettingsLayout({ children }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-[22px] font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Your account, defaults and how the app looks.
        </p>
      </div>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[200px_minmax(0,1fr)]">
        <SettingsNav />
        <div className="flex max-w-3xl min-w-0 flex-col gap-6">{children}</div>
      </div>
    </div>
  );
}
