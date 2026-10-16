'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { describeFailure } from '@/features/generations/generationLabels';
import {
  analysisToPrompt,
  analysisToText,
} from '@/features/vision/visionTasks';

function copy(text, label = 'Copied') {
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success(label))
    .catch(() => toast.error('Could not copy'));
}

function Palette({ palette }) {
  if (!palette?.length) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-ink-3">Dominant palette</p>
      <div className="flex flex-wrap gap-2">
        {palette.map((color) => (
          <button
            key={color.hex}
            type="button"
            onClick={() => copy(color.hex, `${color.hex} copied`)}
            className="flex items-center gap-2 rounded-lg border bg-background p-1.5 pr-2.5 text-xs hover:bg-accent"
            title={`${color.share}% of the image`}
          >
            <span
              className="size-6 rounded-md border"
              style={{ backgroundColor: color.hex }}
            />
            <span className="font-mono">{color.hex}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium text-ink-3">{title}</p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function ResultBody({ analysis }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { result } = analysis;

  switch (analysis.task) {
    case 'describe':
      return (
        <>
          <p className="font-medium">{result.summary}</p>
          {isExpanded ? (
            <p className="text-sm text-muted-foreground">{result.details}</p>
          ) : null}
          <button
            type="button"
            className="w-fit text-xs text-brand hover:underline"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show less' : 'Show full analysis'}
          </button>
          <div className="flex flex-wrap gap-1.5">
            {result.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
          <Palette palette={result.palette} />
        </>
      );
    case 'question':
      return <p className="text-sm whitespace-pre-line">{result.answer}</p>;
    case 'ocr':
      return result.hasText ? (
        <pre className="rounded-lg border bg-background p-3 font-mono text-sm whitespace-pre-wrap">
          {result.text}
        </pre>
      ) : (
        <p className="text-sm text-muted-foreground">No readable text found.</p>
      );
    case 'objects':
      return (
        <>
          <ul className="flex flex-col gap-1.5">
            {result.objects.map((object, index) => (
              <li
                key={`${object.name}-${index}`}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span>
                  {object.name}
                  <span className="text-ink-3"> · {object.location}</span>
                </span>
                <Badge tone="brand">detected</Badge>
              </li>
            ))}
          </ul>
          <p className="text-xs text-ink-3">
            This model does not report confidence, so no percentages are shown.
          </p>
        </>
      );
    case 'design':
      return (
        <>
          <Section title="Layout">{result.layout}</Section>
          <Section title="Style">{result.style}</Section>
          <Section title="Mood">{result.mood}</Section>
          <Section title="Typography">{result.typography}</Section>
          <Section title="Suggestions">
            <ul className="list-disc pl-5">
              {result.suggestions.map((suggestion) => (
                <li key={suggestion}>{suggestion}</li>
              ))}
            </ul>
          </Section>
          <Palette palette={result.palette} />
        </>
      );
    case 'caption':
      return (
        <ul className="flex flex-col gap-2">
          {result.captions.map((caption) => (
            <li
              key={caption}
              className="flex items-start justify-between gap-2 rounded-lg border bg-background p-2 text-sm"
            >
              <span>{caption}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Copy caption"
                onClick={() => copy(caption)}
              >
                <Copy />
              </Button>
            </li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}

export function AnalysisResult({ analysis }) {
  const router = useRouter();

  if (analysis.status === 'failed') {
    return (
      <p className="text-sm text-danger">
        {describeFailure(analysis.errorCategory)}.
        {analysis.credits > 0 ? ` ${analysis.credits} credits refunded.` : ''}
      </p>
    );
  }

  if (analysis.status !== 'succeeded') {
    return <p className="text-sm text-muted-foreground">Still analyzing…</p>;
  }

  const text = analysisToText(analysis);
  const prompt = analysisToPrompt(analysis);

  return (
    <div className="flex flex-col gap-3">
      <ResultBody analysis={analysis} />
      <div className="flex flex-wrap gap-2">
        {text ? (
          <Button variant="outline" size="sm" onClick={() => copy(text)}>
            <Copy />
            Copy
          </Button>
        ) : null}
        {prompt ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(
                `/app/generate?${new URLSearchParams({ prompt: prompt.slice(0, 2000) })}`,
              )
            }
          >
            <Wand2 />
            Use as prompt
          </Button>
        ) : null}
      </div>
    </div>
  );
}
