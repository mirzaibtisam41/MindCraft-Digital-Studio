import { Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export function PromptCard({ value, maxLength, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="generator-prompt">Prompt</Label>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          disabled={disabled || !value}
          onClick={() => onChange('')}
        >
          <Eraser />
          Clear
        </Button>
      </div>
      <textarea
        id="generator-prompt"
        value={value}
        maxLength={maxLength}
        disabled={disabled}
        rows={6}
        placeholder="Describe the image you want, for example a lighthouse on a cliff at golden hour, painted in soft watercolor"
        onChange={(event) => onChange(event.target.value)}
        className="min-h-32 w-full resize-y rounded-lg border bg-background px-3 py-2.5 text-sm shadow-xs outline-none placeholder:text-ink-3 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60 dark:border-input dark:bg-input/30"
      />
      <p className="self-end font-mono text-xs text-ink-3">
        {value.length} / {maxLength}
      </p>
    </div>
  );
}
