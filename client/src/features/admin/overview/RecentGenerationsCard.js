import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { GenerationStatusBadge } from '@/features/admin/generations/GenerationStatusBadge';
import { formatRelativeTime } from '@/lib/formatDate';

export function RecentGenerationsCard({ generations, className }) {
  return (
    <section className={className} aria-label="Recent generations">
      <div className="flex h-full flex-col rounded-xl border bg-card">
        <header className="flex items-center justify-between gap-3 px-5 pt-5 pb-3">
          <h2 className="text-[14.5px] font-semibold">Recent generations</h2>
          <Link
            href="/admin/generations"
            className="inline-flex items-center gap-1 text-[12.5px] text-muted-foreground hover:text-foreground"
          >
            View all <ArrowRight className="size-3.5" />
          </Link>
        </header>
        {generations.length === 0 ? (
          <p className="px-5 pt-4 pb-8 text-center text-[12.5px] text-muted-foreground">
            No generations yet. They appear here as soon as users start creating
            images.
          </p>
        ) : (
          <ul className="flex flex-col divide-y">
            {generations.map((generation) => (
              <li key={generation.id}>
                <Link
                  href={`/admin/generations/${generation.id}`}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-accent/30"
                >
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate text-[13px]">{generation.prompt}</p>
                    <p className="truncate text-[11.5px] text-ink-3">
                      {generation.userEmail} · {generation.model} ·{' '}
                      {formatRelativeTime(generation.createdAt)}
                    </p>
                  </div>
                  <GenerationStatusBadge status={generation.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
