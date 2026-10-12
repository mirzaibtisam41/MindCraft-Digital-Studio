import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/Spinner';
import { formatCredits } from '@/lib/credits';

export function CostCard({
  cost,
  balance,
  count,
  hasEnoughCredits,
  canSubmit,
  isGenerating,
  onSubmit,
  children,
}) {
  return (
    <div className="sticky bottom-20 flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm md:bottom-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10.5px] font-semibold tracking-wider text-ink-3 uppercase">
            Estimated cost
          </p>
          <p className="text-lg font-semibold">
            {cost ? formatCredits(cost.total) : '—'}
          </p>
        </div>
        {cost ? (
          <p className="font-mono text-xs text-ink-3">
            {count} × {cost.perImage} cr
          </p>
        ) : null}
      </div>
      {balance !== null && cost ? (
        <p className="flex justify-between text-[12.5px] text-muted-foreground">
          <span>Balance after run</span>
          <span className="font-mono">
            {hasEnoughCredits ? `${balance - cost.total} cr` : '—'}
          </span>
        </p>
      ) : null}
      {children}
      <Button
        type="button"
        size="lg"
        disabled={!canSubmit || !hasEnoughCredits || isGenerating}
        onClick={onSubmit}
      >
        {isGenerating ? <Spinner /> : <Sparkles />}
        {isGenerating
          ? 'Generating…'
          : `Generate ${count} ${count === 1 ? 'image' : 'images'}`}
      </Button>
    </div>
  );
}
