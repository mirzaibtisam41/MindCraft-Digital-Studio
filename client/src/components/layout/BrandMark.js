import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BrandMark({ className }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-linear-to-b from-brand-from to-brand-to text-white shadow-sm',
        className,
      )}
    >
      <Sparkles className="size-[18px]" />
    </span>
  );
}
