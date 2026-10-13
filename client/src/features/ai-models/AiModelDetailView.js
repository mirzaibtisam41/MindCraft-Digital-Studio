'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FormAlert } from '@/components/ui/FormAlert';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAiModelQuery } from '@/features/ai-models/aiModelsApi';
import { findAiModelStatus } from '@/features/ai-models/aiModelStatuses';
import { WorkflowCard } from '@/features/ai-models/WorkflowCard';
import { useGetModelWorkflowsQuery } from '@/features/generation-types/generationTypesApi';
import { getErrorMessage } from '@/lib/apiError';

function ModelHeader({ model }) {
  const status = findAiModelStatus(model.status);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="flex flex-wrap items-center gap-2 text-[22px] font-semibold tracking-tight">
        {model.name}
        <Badge tone={status.tone}>{status.label}</Badge>
      </h1>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <span>
          Provider:{' '}
          <span className="text-foreground">{model.provider.name}</span>
        </span>
        {model.provider.isActive ? null : (
          <Badge tone="warning">Provider inactive</Badge>
        )}
        <span className="font-mono text-xs">{model.providerModelId}</span>
        <span className="font-mono text-xs text-ink-3">{model.slug}</span>
      </p>
      {model.description ? (
        <p className="text-muted-foreground">{model.description}</p>
      ) : null}
    </div>
  );
}

export function AiModelDetailView({ modelId }) {
  const model = useGetAiModelQuery(modelId);
  const workflows = useGetModelWorkflowsQuery(modelId);
  const error = model.error ?? workflows.error;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/models"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All models
      </Link>

      {error ? <FormAlert>{getErrorMessage(error)}</FormAlert> : null}

      {model.isLoading ? <Skeleton className="h-16 w-full" /> : null}
      {model.data ? <ModelHeader model={model.data} /> : null}

      <div className="flex flex-col gap-1">
        <h2 className="text-[16px] font-semibold">Workflows</h2>
        <p className="text-sm text-muted-foreground">
          Choose which workflows this model offers and the options users can
          pick. A workflow needs its options before it can be turned on.
        </p>
      </div>

      {workflows.isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map((row) => (
            <Skeleton key={row} className="h-48 w-full" />
          ))}
        </div>
      ) : null}

      {workflows.data?.workflows.map((workflow) => (
        <WorkflowCard
          key={`${workflow.generationType.id}-${workflow.updatedAt ?? 'new'}`}
          modelId={modelId}
          workflow={workflow}
          availableOptions={workflows.data.availableOptions}
        />
      ))}
    </div>
  );
}
