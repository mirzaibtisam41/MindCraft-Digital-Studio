import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AUDIT_ACTION_OPTIONS } from '@/constants/admin';
import { describeChanges } from '@/features/admin/audit/describeChanges';
import { formatRelativeTime } from '@/lib/formatDate';

const ACTION_LABELS = Object.fromEntries(
  AUDIT_ACTION_OPTIONS.map(({ value, label }) => [value, label]),
);

export function RecentActivityCard({ entries, className }) {
  return (
    <section className={className} aria-label="Admin activity">
      <div className="flex h-full flex-col rounded-xl border bg-card">
        <header className="flex items-center justify-between gap-3 px-5 pt-5 pb-3">
          <h2 className="text-[14.5px] font-semibold">Admin activity</h2>
          <Link
            href="/admin/audit-logs"
            className="inline-flex items-center gap-1 text-[12.5px] text-muted-foreground hover:text-foreground"
          >
            Audit log <ArrowRight className="size-3.5" />
          </Link>
        </header>
        {entries.length === 0 ? (
          <p className="px-5 pt-4 pb-8 text-center text-[12.5px] text-muted-foreground">
            No admin changes recorded yet.
          </p>
        ) : (
          <ol className="flex flex-col gap-4 px-5 pt-1 pb-5">
            {entries.map((entry) => (
              <li key={entry.id} className="flex gap-3">
                <span
                  className="mt-1.5 size-2 shrink-0 rounded-full bg-brand"
                  aria-hidden
                />
                <div className="flex min-w-0 flex-col">
                  <p className="text-[13px]">
                    <span className="font-medium">
                      {entry.actorName ?? 'Deleted admin'}
                    </span>{' '}
                    <span className="text-muted-foreground">
                      {(
                        ACTION_LABELS[entry.action] ?? entry.action
                      ).toLowerCase()}
                    </span>
                  </p>
                  <p className="truncate text-[11.5px] text-ink-3">
                    {describeChanges(entry.changes).join(' · ') ||
                      entry.targetId}
                  </p>
                  <p className="text-[11.5px] text-ink-3">
                    {formatRelativeTime(entry.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
