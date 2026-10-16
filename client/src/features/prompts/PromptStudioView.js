'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import {
  Copy,
  Lightbulb,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  Wand2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/FormAlert';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/Spinner';
import { Textarea } from '@/components/ui/textarea';
import { useGetMyGenerationsQuery } from '@/features/generations/generationsApi';
import {
  splitByPhrases,
  splitByPlaceholders,
} from '@/features/prompts/highlightText';
import { CATEGORY_LABELS } from '@/features/prompts/promptLabels';
import {
  useDeletePromptMutation,
  useEnhancePromptMutation,
  useGetMyPromptsQuery,
  useGetPromptOptionsQuery,
  useMarkPromptUsedMutation,
} from '@/features/prompts/promptsApi';
import { SavePromptDialog } from '@/features/prompts/SavePromptDialog';
import { getErrorMessage } from '@/lib/apiError';
import { cn } from '@/lib/utils';

const DRAFT_KEY = 'mindcraft.promptStudio.draft';
const PROMPT_MAX_LENGTH = 2000;

function readDraft() {
  try {
    return window.localStorage.getItem(DRAFT_KEY) ?? '';
  } catch {
    return '';
  }
}

function writeDraft(text) {
  try {
    window.localStorage.setItem(DRAFT_KEY, text);
  } catch {
    return;
  }
}

function copyText(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success('Copied'))
    .catch(() => toast.error('Could not copy'));
}

function HighlightedText({ parts, markClassName }) {
  return parts.map((part, index) =>
    part.isMatch ? (
      <mark
        key={index}
        className={cn('rounded bg-transparent font-medium', markClassName)}
      >
        {part.text}
      </mark>
    ) : (
      <span key={index}>{part.text}</span>
    ),
  );
}

function subscribeToNothing() {
  return () => {};
}

export function PromptStudioView() {
  const isClient = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );

  return isClient ? <PromptStudio /> : <Skeleton className="h-96 w-full" />;
}

function PromptStudio() {
  const router = useRouter();
  const [text, setText] = useState(readDraft);
  const [style, setStyle] = useState(null);
  const [category, setCategory] = useState('all');
  const [selectedPromptId, setSelectedPromptId] = useState(null);
  const [enhanced, setEnhanced] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [saveText, setSaveText] = useState(null);

  const { data: options } = useGetPromptOptionsQuery();
  const { data: library, isLoading: isLoadingLibrary } = useGetMyPromptsQuery(
    category === 'all' ? {} : { category },
  );
  const { data: history } = useGetMyGenerationsQuery({ page: 1, limit: 30 });
  const [enhancePrompt, { isLoading: isEnhancing }] =
    useEnhancePromptMutation();
  const [deletePrompt] = useDeletePromptMutation();
  const [markPromptUsed] = useMarkPromptUsedMutation();

  useEffect(() => {
    const timer = setTimeout(() => writeDraft(text), 400);

    return () => clearTimeout(timer);
  }, [text]);

  const prompts = library?.prompts ?? [];
  const selectedPrompt =
    prompts.find((prompt) => prompt.id === selectedPromptId) ?? null;
  const recentPrompts = [
    ...new Set((history?.generations ?? []).map((item) => item.prompt)),
  ].slice(0, 5);

  function loadText(nextText, nextStyle = null, promptId = null) {
    setText(nextText);
    setStyle(nextStyle);
    setSelectedPromptId(promptId);
    setEnhanced(null);
    setErrorMessage('');
  }

  async function improve(anotherAngle = false) {
    if (!text.trim()) return;

    setErrorMessage('');

    try {
      const result = await enhancePrompt({
        prompt: text.trim(),
        style,
        anotherAngle,
      }).unwrap();
      setEnhanced(result);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  function openInGenerator(promptText) {
    if (selectedPromptId) markPromptUsed(selectedPromptId);

    router.push(
      `/app/generate?${new URLSearchParams({ prompt: promptText.slice(0, PROMPT_MAX_LENGTH) })}`,
    );
  }

  async function removeSelected() {
    try {
      await deletePrompt(selectedPromptId).unwrap();
      toast.success('Prompt deleted');
      loadText('');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-[22px] font-semibold tracking-tight">
          Prompt Studio
        </h1>
        <p className="text-muted-foreground">
          Write, improve and save prompts you want to use again.
        </p>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[240px_minmax(0,1fr)_300px]">
        <aside className="flex flex-col gap-4 rounded-xl border bg-card p-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-ink-3">Categories</p>
            {['all', ...(options?.categories ?? [])].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                aria-pressed={category === item}
                className={cn(
                  'flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent',
                  category === item && 'bg-brand-tint text-brand',
                )}
              >
                {item === 'all' ? 'All prompts' : CATEGORY_LABELS[item]}
                <span className="text-xs text-ink-3">
                  {library?.categoryCounts?.[item] ?? 0}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-ink-3">Saved prompts</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadText('')}
                aria-label="New prompt"
              >
                <Plus />
                New
              </Button>
            </div>
            {isLoadingLibrary ? <Skeleton className="h-24 w-full" /> : null}
            {!isLoadingLibrary && prompts.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No saved prompts yet.
              </p>
            ) : null}
            {prompts.map((prompt) => (
              <button
                key={prompt.id}
                type="button"
                onClick={() => loadText(prompt.text, prompt.style, prompt.id)}
                className={cn(
                  'flex flex-col gap-0.5 rounded-lg border p-2 text-left transition-colors hover:bg-accent',
                  selectedPromptId === prompt.id && 'border-brand/60',
                )}
              >
                <span className="truncate text-sm font-medium">
                  {prompt.title}
                </span>
                <span className="line-clamp-2 text-xs text-muted-foreground">
                  {prompt.text}
                </span>
                <span className="text-[11px] text-ink-3">
                  {CATEGORY_LABELS[prompt.category]} · used {prompt.usageCount}×
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-4 rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="studio-prompt">
                {selectedPrompt ? selectedPrompt.title : 'Prompt editor'}
              </Label>
              <span className="text-xs text-ink-3">
                {text.length.toLocaleString()}/
                {PROMPT_MAX_LENGTH.toLocaleString()} · draft · autosaved
              </span>
            </div>
            <Textarea
              id="studio-prompt"
              rows={6}
              maxLength={PROMPT_MAX_LENGTH}
              placeholder="A cat sleeping on a bookshelf"
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                setEnhanced(null);
              }}
            />
            <div className="flex flex-wrap gap-2">
              {(options?.styles ?? []).map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={style === item}
                  onClick={() => setStyle(style === item ? null : item)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-sm transition-colors hover:bg-accent',
                    style === item &&
                      'border-brand/60 bg-brand-tint text-brand',
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
            <FormAlert>{errorMessage}</FormAlert>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => improve(false)}
                disabled={!text.trim() || isEnhancing}
              >
                {isEnhancing ? <Spinner /> : <Sparkles />}
                {isEnhancing ? 'Improving…' : 'Improve prompt'}
              </Button>
              <Button
                variant="outline"
                disabled={!text.trim()}
                onClick={() => openInGenerator(text)}
              >
                <Wand2 />
                Use in Generator
              </Button>
              <Button
                variant="outline"
                disabled={!text.trim()}
                onClick={() => setSaveText(text)}
              >
                <Save />
                {selectedPrompt ? 'Save changes' : 'Save prompt'}
              </Button>
              {selectedPrompt ? (
                <Button variant="ghost" onClick={removeSelected}>
                  <Trash2 />
                  Delete
                </Button>
              ) : null}
            </div>
          </div>

          {enhanced ? (
            <div className="flex flex-col gap-3 rounded-xl border border-brand/40 bg-card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="brand">
                  Enhanced
                  {style ? ` · ${style}` : ''} +
                  {enhanced.addedDescriptors.length} descriptors
                </Badge>
                <span className="text-xs text-ink-3">{enhanced.model}</span>
              </div>
              <p className="text-sm leading-relaxed">
                <HighlightedText
                  parts={splitByPhrases(
                    enhanced.enhancedPrompt,
                    enhanced.addedDescriptors,
                  )}
                  markClassName="text-brand"
                />
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => openInGenerator(enhanced.enhancedPrompt)}
                >
                  <Wand2 />
                  Use in Generator
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyText(enhanced.enhancedPrompt)}
                >
                  <Copy />
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSaveText(enhanced.enhancedPrompt)}
                >
                  <Save />
                  Save prompt
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isEnhancing}
                  onClick={() => improve(true)}
                >
                  <RefreshCw />
                  Try another angle
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    loadText(enhanced.enhancedPrompt, style, selectedPromptId)
                  }
                >
                  Edit this version
                </Button>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-2 rounded-xl border bg-card p-4">
            <p className="text-sm font-medium">Recently used</p>
            {recentPrompts.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Prompts you generate with will show up here.
              </p>
            ) : null}
            {recentPrompts.map((prompt) => (
              <div
                key={prompt}
                className="flex items-center justify-between gap-3 rounded-lg border p-2"
              >
                <span className="truncate text-sm">{prompt}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => loadText(prompt)}
                >
                  Reuse
                </Button>
              </div>
            ))}
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
            <p className="text-sm font-medium">Templates</p>
            {(options?.templates ?? []).map((template) => (
              <div
                key={template.id}
                className="flex flex-col gap-2 rounded-lg border p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{template.title}</span>
                  <Badge>{CATEGORY_LABELS[template.category]}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  <HighlightedText
                    parts={splitByPlaceholders(template.text)}
                    markClassName="font-mono text-brand"
                  />
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => loadText(template.text)}
                >
                  Use template
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-3 rounded-xl border bg-card p-4 text-sm text-muted-foreground">
            <Lightbulb className="size-5 shrink-0 text-brand" />
            <p>
              The enhancer adds missing layers like lighting, setting and
              composition. It never rewrites your idea. Replace the{' '}
              <span className="font-mono text-brand">[PLACEHOLDERS]</span> in a
              template before improving it.
            </p>
          </div>
        </aside>
      </div>

      <SavePromptDialog
        open={saveText !== null}
        text={saveText ?? ''}
        style={style}
        prompt={saveText === text ? selectedPrompt : null}
        categories={options?.categories ?? []}
        onOpenChange={(open) => {
          if (!open) setSaveText(null);
        }}
        onSaved={(saved) => setSelectedPromptId(saved.id)}
      />
    </div>
  );
}
