'use client';

import { useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RefreshCw, ScanEye, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/FormAlert';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/Spinner';
import { useGetMyWalletQuery } from '@/features/credits/walletApi';
import { SourceImagePanel } from '@/features/editing/SourceImagePanel';
import { useGetImageQuery } from '@/features/images/imagesApi';
import { AnalysisResult } from '@/features/vision/AnalysisResult';
import {
  useCreateImageAnalysisMutation,
  useGetImageAnalysesQuery,
  useGetVisionOptionsQuery,
} from '@/features/vision/visionApi';
import { VISION_TASKS, findVisionTask } from '@/features/vision/visionTasks';
import { getErrorMessage } from '@/lib/apiError';

function UserBubble({ children }) {
  return (
    <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-brand-tint px-4 py-2 text-sm text-foreground">
      {children}
    </div>
  );
}

function describeRequest(analysis) {
  return analysis.task === 'question'
    ? analysis.question
    : findVisionTask(analysis.task)?.label;
}

export function VisionView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const imageId = searchParams.get('imageId');
  const questionRef = useRef(null);
  const [question, setQuestion] = useState('');
  const [pending, setPending] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const { data: options } = useGetVisionOptionsQuery();
  const { data: wallet } = useGetMyWalletQuery();
  const { data: image, isLoading: isLoadingImage } = useGetImageQuery(imageId, {
    skip: !imageId,
  });
  const { data: analyses = [], isLoading: isLoadingAnalyses } =
    useGetImageAnalysesQuery(imageId, { skip: !imageId });
  const [createImageAnalysis] = useCreateImageAnalysisMutation();

  const cost = options?.creditsPerAnalysis ?? 0;
  const hasEnoughCredits = !wallet || wallet.balance >= cost;
  const isBusy = Boolean(pending);

  function chooseImage(chosen) {
    setErrorMessage('');
    router.replace(chosen ? `/app/vision?imageId=${chosen.id}` : '/app/vision');
  }

  async function run(task, questionText = null) {
    setErrorMessage('');
    setPending({ task, question: questionText });

    try {
      await createImageAnalysis({
        imageId,
        task,
        ...(questionText ? { question: questionText } : {}),
      }).unwrap();

      if (questionText) setQuestion('');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setPending(null);
    }
  }

  function handleChip(task) {
    if (task === 'question') {
      questionRef.current?.focus();
      return;
    }

    run(task);
  }

  function handleAsk(event) {
    event.preventDefault();

    if (question.trim() && !isBusy && hasEnoughCredits) {
      run('question', question.trim());
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-[22px] font-semibold tracking-tight">AI Vision</h1>
        <p className="text-muted-foreground">
          Ask AI about any of your images: describe it, read its text, list
          objects or review its design.
        </p>
      </div>

      {!imageId ? (
        <div className="mx-auto w-full max-w-xl rounded-xl border bg-card p-6">
          <SourceImagePanel
            label="Image to analyze"
            image={null}
            onChange={chooseImage}
          />
        </div>
      ) : null}

      {imageId && isLoadingImage ? <Skeleton className="h-96 w-full" /> : null}

      {image ? (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
          <div className="flex flex-col gap-4 rounded-xl border bg-card p-4">
            <img
              src={image.url}
              alt="Image being analyzed"
              className="w-full rounded-lg bg-muted object-contain"
              style={{ aspectRatio: `${image.width} / ${image.height}` }}
            />
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm text-muted-foreground">
                {image.originalFileName ?? image.prompt ?? 'Image'}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={isBusy}
                onClick={() => chooseImage(null)}
              >
                <RefreshCw />
                Replace
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Ask AI Vision to…</p>
              <div className="flex flex-wrap gap-2">
                {VISION_TASKS.map((task) => (
                  <button
                    key={task.value}
                    type="button"
                    disabled={isBusy || !hasEnoughCredits}
                    onClick={() => handleChip(task.value)}
                    className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors enabled:hover:border-brand/50 enabled:hover:bg-brand-tint disabled:opacity-50"
                  >
                    <task.icon className="size-3.5" />
                    {task.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-ink-3">
                {cost === 0
                  ? 'Analyses are free right now.'
                  : `${cost} ${cost === 1 ? 'credit' : 'credits'} per analysis`}
                {options?.model ? ` · ${options.model}` : ''}
              </p>
            </div>
          </div>

          <div className="flex min-h-[420px] flex-col gap-4 rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between gap-3 border-b pb-3">
              <p className="text-sm font-medium">Analysis</p>
              <span className="text-xs text-ink-3">
                {analyses.length}{' '}
                {analyses.length === 1 ? 'analysis' : 'analyses'}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-5">
              {isLoadingAnalyses ? <Skeleton className="h-24 w-full" /> : null}
              {!isLoadingAnalyses && analyses.length === 0 && !pending ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                  <ScanEye className="size-6" />
                  Pick something to ask on the left, or type a question below.
                </div>
              ) : null}
              {analyses.map((analysis) => (
                <div key={analysis.id} className="flex flex-col gap-3">
                  <UserBubble>{describeRequest(analysis)}</UserBubble>
                  <div className="max-w-[95%] rounded-2xl rounded-bl-sm border bg-background/40 p-4">
                    <AnalysisResult analysis={analysis} />
                  </div>
                </div>
              ))}
              {pending ? (
                <div className="flex flex-col gap-3">
                  <UserBubble>{describeRequest(pending)}</UserBubble>
                  <div className="flex w-fit items-center gap-2 rounded-2xl rounded-bl-sm border p-3 text-sm text-muted-foreground">
                    <Spinner />
                    Analyzing…
                  </div>
                </div>
              ) : null}
            </div>

            <FormAlert>{errorMessage}</FormAlert>

            <form onSubmit={handleAsk} className="flex gap-2 border-t pt-3">
              <Input
                ref={questionRef}
                value={question}
                maxLength={500}
                disabled={isBusy}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask a follow-up question about this image"
                aria-label="Question"
              />
              <Button
                type="submit"
                disabled={!question.trim() || isBusy || !hasEnoughCredits}
                aria-label="Send question"
              >
                <Send />
              </Button>
            </form>
            {!hasEnoughCredits ? (
              <p className="text-xs text-danger">
                You need {cost} credits for an analysis.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
