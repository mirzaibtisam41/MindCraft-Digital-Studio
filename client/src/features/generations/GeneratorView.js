'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { FormAlert } from '@/components/ui/FormAlert';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetMyWalletQuery } from '@/features/credits/walletApi';
import { ImagePreviewDialog } from '@/features/images/ImagePreviewDialog';
import { GenerationHistory } from '@/features/generations/GenerationHistory';
import { GenerationResult } from '@/features/generations/GenerationResult';
import { GeneratorForm } from '@/features/generations/GeneratorForm';
import { NoModels } from '@/features/generations/NoModels';
import {
  readOptionsFromUrl,
  useGeneratorOptions,
} from '@/features/generations/useGeneratorOptions';
import {
  useCreateGenerationMutation,
  useGetGenerationOptionsQuery,
  useGetMyGenerationsQuery,
} from '@/features/generations/generationsApi';
import { getErrorMessage } from '@/lib/apiError';

export function GeneratorView() {
  const { data: models, isLoading, error } = useGetGenerationOptionsQuery();
  const { data: wallet } = useGetMyWalletQuery();
  const { data: history } = useGetMyGenerationsQuery({ page: 1, limit: 10 });
  const [createGeneration] = useCreateGenerationMutation();

  const searchParams = useSearchParams();
  const [prompt, setPrompt] = useState(
    () => searchParams.get('prompt')?.slice(0, 2000) ?? '',
  );
  const { model, options, changeModel, changeOption } = useGeneratorOptions({
    models,
    initialModelId: searchParams.get('modelId'),
    initialOptions: readOptionsFromUrl(searchParams),
  });
  const [pendingCount, setPendingCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [shownGenerationId, setShownGenerationId] = useState(null);
  const [lastCreated, setLastCreated] = useState(null);
  const [openImageId, setOpenImageId] = useState(null);

  const shownGeneration =
    history?.generations.find((item) => item.id === shownGenerationId) ??
    (lastCreated?.id === shownGenerationId ? lastCreated : null);
  const openImage =
    shownGeneration?.images.find((image) => image.id === openImageId) ?? null;

  async function generate() {
    const requestedCount = options.n;
    setErrorMessage('');
    setPendingCount(requestedCount);

    try {
      const generation = await createGeneration({
        modelId: model.id,
        prompt: prompt.trim(),
        options,
      }).unwrap();

      setLastCreated(generation);
      setShownGenerationId(generation.id);
      toast.success(
        generation.images.length === 1
          ? 'Image generated'
          : `${generation.images.length} images generated`,
      );
    } catch (requestError) {
      setErrorMessage(getErrorMessage(requestError));
    } finally {
      setPendingCount(0);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-[22px] font-semibold tracking-tight">
          Image Generator
        </h1>
        <p className="text-muted-foreground">
          Describe an image and choose how it should look.
        </p>
      </div>

      {error ? <FormAlert>{getErrorMessage(error)}</FormAlert> : null}

      {isLoading ? <Skeleton className="h-96 w-full" /> : null}

      {models && models.length === 0 ? (
        <NoModels message="An admin needs to turn on a model before you can generate images." />
      ) : null}

      {model ? (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(320px,380px)_minmax(0,1fr)]">
          <GeneratorForm
            models={models}
            model={model}
            onModelChange={changeModel}
            prompt={prompt}
            onPromptChange={setPrompt}
            options={options}
            onOptionChange={changeOption}
            balance={wallet?.balance}
            isGenerating={pendingCount > 0}
            onGenerate={generate}
          />

          <div className="flex min-w-0 flex-col gap-6">
            <GenerationResult
              generation={shownGeneration}
              pendingCount={pendingCount}
              errorMessage={errorMessage}
              onOpenImage={(image) => setOpenImageId(image.id)}
              onClose={() => {
                setErrorMessage('');
                setShownGenerationId(null);
              }}
            />
            <GenerationHistory
              selectedId={shownGeneration?.id}
              onSelect={(generation) => {
                setErrorMessage('');
                setShownGenerationId(generation.id);
              }}
            />
          </div>
        </div>
      ) : null}

      <ImagePreviewDialog
        image={openImage}
        onOpenChange={(open) => {
          if (!open) setOpenImageId(null);
        }}
      />
    </div>
  );
}
