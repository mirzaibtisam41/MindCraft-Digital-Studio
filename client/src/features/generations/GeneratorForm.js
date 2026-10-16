'use client';

import { Minus, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/Spinner';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  FORMAT_LABELS,
  QUALITY_LABELS,
  SIZE_LABELS,
} from '@/features/generations/generationLabels';
import { PromptTools } from '@/features/prompts/PromptTools';
import { cn } from '@/lib/utils';

const PROMPT_MAX_LENGTH = 2000;

function OptionGroup({ label, value, onChange, items, disabled }) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <ToggleGroup
        type="single"
        variant="outline"
        value={value}
        disabled={disabled}
        onValueChange={(next) => {
          if (next) onChange(next);
        }}
        className="w-full"
      >
        {items.map((item) => (
          <ToggleGroupItem
            key={item.value}
            value={item.value}
            className="h-auto flex-1 flex-col gap-0 py-1.5 data-[state=on]:bg-brand-tint data-[state=on]:text-brand data-[state=on]:ring-1 data-[state=on]:ring-brand/60"
            aria-label={item.label}
          >
            <span>{item.label}</span>
            {item.hint ? (
              <span className="text-[11px] text-ink-3">{item.hint}</span>
            ) : null}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

export function GeneratorForm({
  models,
  model,
  onModelChange,
  prompt,
  onPromptChange,
  options,
  onOptionChange,
  balance,
  isGenerating,
  onGenerate,
  submitLabel,
  promptPlaceholder = 'A red fox sitting in fresh snow, soft morning light',
  isReady = true,
  children,
}) {
  const { enabledOptions, prices } = model;
  const pricePerImage = prices[options.quality];
  const totalCredits = pricePerImage * options.n;
  const hasPrompt = prompt.trim().length > 0;
  const hasEnoughCredits = balance === undefined || balance >= totalCredits;
  const cheapestPrice = Math.min(...Object.values(prices));

  function handleSubmit(event) {
    event.preventDefault();

    if (isReady && hasPrompt && hasEnoughCredits && !isGenerating) onGenerate();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-xl border bg-card p-4"
    >
      {children}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="generator-prompt">Prompt</Label>
          <div className="flex items-center gap-2 text-xs text-ink-3">
            <span
              className={cn(
                prompt.length > PROMPT_MAX_LENGTH * 0.9 && 'text-warning',
              )}
            >
              {prompt.length.toLocaleString()}/
              {PROMPT_MAX_LENGTH.toLocaleString()}
            </span>
            <PromptTools
              prompt={prompt}
              onPromptChange={onPromptChange}
              disabled={isGenerating}
            />
            {prompt ? (
              <button
                type="button"
                className="hover:text-foreground"
                onClick={() => onPromptChange('')}
                disabled={isGenerating}
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>
        <Textarea
          id="generator-prompt"
          rows={5}
          maxLength={PROMPT_MAX_LENGTH}
          placeholder={promptPlaceholder}
          value={prompt}
          disabled={isGenerating}
          onChange={(event) => onPromptChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
              handleSubmit(event);
            }
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Model</Label>
        {models.length > 1 ? (
          <Select
            value={model.id}
            onValueChange={onModelChange}
            disabled={isGenerating}
          >
            <SelectTrigger aria-label="Model">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {models.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
        <div className="flex flex-col gap-1 rounded-lg border bg-background p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium">{model.name}</span>
            <span className="text-xs text-ink-3">
              from {cheapestPrice} cr / image
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {model.provider.name}
            {model.description ? ` · ${model.description}` : ''}
          </span>
        </div>
      </div>

      <OptionGroup
        label="Aspect ratio"
        value={options.size}
        disabled={isGenerating}
        onChange={(size) => onOptionChange({ size })}
        items={enabledOptions.sizes.map((size) => ({
          value: size,
          label: SIZE_LABELS[size] ?? size,
          hint: size.replace('x', ' × '),
        }))}
      />

      <OptionGroup
        label="Quality"
        value={options.quality}
        disabled={isGenerating}
        onChange={(quality) => onOptionChange({ quality })}
        items={enabledOptions.qualities.map((quality) => ({
          value: quality,
          label: QUALITY_LABELS[quality] ?? quality,
          hint: `${prices[quality]} cr`,
        }))}
      />

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-2">
          <Label>Images</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Fewer images"
              disabled={isGenerating || options.n <= 1}
              onClick={() => onOptionChange({ n: options.n - 1 })}
            >
              <Minus />
            </Button>
            <span className="w-6 text-center font-medium tabular-nums">
              {options.n}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="More images"
              disabled={
                isGenerating || options.n >= enabledOptions.maxImagesPerRequest
              }
              onClick={() => onOptionChange({ n: options.n + 1 })}
            >
              <Plus />
            </Button>
          </div>
        </div>

        {enabledOptions.outputFormats.length > 1 ? (
          <div className="flex flex-1 flex-col gap-2">
            <Label>Format</Label>
            <Select
              value={options.outputFormat}
              onValueChange={(outputFormat) => onOptionChange({ outputFormat })}
              disabled={isGenerating}
            >
              <SelectTrigger aria-label="Format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {enabledOptions.outputFormats.map((format) => (
                  <SelectItem key={format} value={format}>
                    {FORMAT_LABELS[format] ?? format}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>

      <div className="sticky bottom-0 flex flex-col gap-3 rounded-lg border bg-background p-3">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm text-muted-foreground">Estimated cost</span>
          <span className="font-mono text-lg font-semibold">
            {totalCredits} credits
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 text-xs text-ink-3">
          <span>
            {options.n} × {pricePerImage} cr
          </span>
          {balance === undefined ? null : (
            <span className={cn(!hasEnoughCredits && 'text-danger')}>
              {hasEnoughCredits
                ? `Balance after run: ${(balance - totalCredits).toLocaleString()}`
                : `You have ${balance.toLocaleString()} credits`}
            </span>
          )}
        </div>
        <Button
          type="submit"
          disabled={!isReady || !hasPrompt || !hasEnoughCredits || isGenerating}
        >
          {isGenerating ? <Spinner /> : <Sparkles />}
          {isGenerating
            ? 'Generating…'
            : (submitLabel ??
              `Generate ${options.n} ${options.n === 1 ? 'image' : 'images'}`)}
        </Button>
      </div>
    </form>
  );
}
