import Link from 'next/link';
import { ADMIN_TOOLS } from '@/constants/navigation';

export const metadata = { title: 'Admin' };

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-[22px] font-semibold tracking-tight">
          Admin console
        </h1>
        <p className="text-muted-foreground">
          Manage users, AI models and platform settings.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ADMIN_TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="flex flex-col gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-brand/40 hover:bg-brand-tint/40"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-brand-tint text-brand">
              <tool.icon className="size-5" />
            </span>
            <div className="flex flex-col gap-1">
              <p className="font-medium">{tool.label}</p>
              <p className="text-sm text-muted-foreground">
                {tool.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
