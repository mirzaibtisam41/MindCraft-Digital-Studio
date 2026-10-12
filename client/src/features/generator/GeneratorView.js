'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CostCard } from '@/features/generator/CostCard';
import { EmptyResults } from '@/features/generator/EmptyResults';
import {
  FailureNotice,
  InsufficientCreditsNotice,
} from '@/features/generator/GenerationNotice';
import { GeneratingCard } from '@/features/generator/GeneratingCard';
import { ModelPicker } from '@/features/generator/ModelPicker';
import { OptionsPanel } from '@/features/generator/OptionsPanel';
import { PromptCard } from '@/features/generator/PromptCard';
import { ResultsPanel } from '@/features/generator/ResultsPanel';
import { FormAlert } from '@/components/ui/FormAlert';
import { useImageGenerator } from '@/hooks/useImageGenerator';
import { getErrorMessage } from '@/lib/apiError';

const PROMPT_MAX_LENGTH = 4000;

function GeneratorSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[400px_minmax(0,1fr)]">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-52 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

export function GeneratorView({ initialPrompt }) {
  const generator = useImageGenerator({ initialPrompt });
  const { options, model, values, cost, balance, isGenerating } = generator;

  if (options.isLoading) return <GeneratorSkeleton />;

  if (options.isError || !model) {
    return (
      <div className="flex flex-col items-start gap-3">
        <FormAlert>{getErrorMessage(options.error)}</FormAlert>
        <Button variant="secondary" onClick={options.refetch}>
          Try again
        </Button>
      </div>
    );
  }

  const maxLength = Math.min(PROMPT_MAX_LENGTH, model.maxPromptLength);
  const canSubmit = values.prompt.trim().length > 0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[400px_minmax(0,1fr)]">
      <section aria-label="Generation settings" className="flex flex-col gap-5">
        <PromptCard
          value={values.prompt}
          maxLength={maxLength}
          disabled={isGenerating}
          onChange={(next) => generator.change('prompt', next)}
        />
        <ModelPicker
          model={model}
          models={generator.models}
          disabled={isGenerating}
          onChange={(next) => generator.change('modelId', next)}
        />
        <OptionsPanel
          model={model}
          styles={generator.styles}
          values={values}
          change={generator.change}
          disabled={isGenerating}
        />
        <CostCard
          cost={cost}
          balance={balance}
          count={values.count}
          hasEnoughCredits={generator.hasEnoughCredits}
          canSubmit={canSubmit}
          isGenerating={isGenerating}
          onSubmit={generator.submit}
        >
          {!generator.hasEnoughCredits ? (
            <InsufficientCreditsNotice
              cost={cost}
              balance={balance}
              maxAffordableCount={generator.maxAffordableCount}
              onUseCount={(next) => generator.change('count', next)}
            />
          ) : null}
        </CostCard>
      </section>

      <section aria-label="Results" className="flex min-w-0 flex-col gap-4">
        {generator.failure ? (
          <FailureNotice
            error={generator.failure}
            onDismiss={generator.dismissFailure}
          />
        ) : null}
        {isGenerating ? (
          <GeneratingCard count={values.count} model={model} />
        ) : null}
        {generator.results.length > 0 ? (
          <ResultsPanel
            key={generator.results[0].id}
            results={generator.results}
          />
        ) : null}
        {!isGenerating && generator.results.length === 0 ? (
          <EmptyResults />
        ) : null}
      </section>
    </div>
  );
}
