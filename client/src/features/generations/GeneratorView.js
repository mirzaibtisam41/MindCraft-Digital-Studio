'use client';

import { useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { FormAlert } from '@/components/ui/FormAlert';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetMyWalletQuery } from '@/features/credits/walletApi';
import { ImagePreviewDialog } from '@/features/images/ImagePreviewDialog';
import { GenerationHistory } from '@/features/generations/GenerationHistory';
import { GenerationResult } from '@/features/generations/GenerationResult';
import { GeneratorForm } from '@/features/generations/GeneratorForm';
import {
  useCreateGenerationMutation,
  useGetGenerationOptionsQuery,
  useGetMyGenerationsQuery,
} from '@/features/generations/generationsApi';
import { getErrorMessage } from '@/lib/apiError';

function NoModels() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
      <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <ImagePlus className="size-5" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-medium">No image models are available yet</p>
        <p className="text-sm text-muted-foreground">
          An admin needs to turn on a model before you can generate images.
        </p>
      </div>
    </div>
  );
}

export function GeneratorView() {
  const { data: models, isLoading, error } = useGetGenerationOptionsQuery();
  const { data: wallet } = useGetMyWalletQuery();
  const { data: history } = useGetMyGenerationsQuery({ page: 1, limit: 10 });
  const [createGeneration] = useCreateGenerationMutation();

  const [selectedModelId, setSelectedModelId] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [chosenOptions, setChosenOptions] = useState({});
  const [pendingCount, setPendingCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [shownGenerationId, setShownGenerationId] = useState(null);
  const [lastCreated, setLastCreated] = useState(null);
  const [openImage, setOpenImage] = useState(null);

  const model =
    models?.find((item) => item.id === selectedModelId) ?? models?.[0];
  const options = model
    ? {
        ...model.defaultOptions,
        quality: model.enabledOptions.qualities.includes(
          model.defaultOptions.quality,
        )
          ? model.defaultOptions.quality
          : model.enabledOptions.qualities[0],
        ...chosenOptions,
      }
    : null;

  const shownGeneration =
    history?.generations.find((item) => item.id === shownGenerationId) ??
    (lastCreated?.id === shownGenerationId ? lastCreated : null);

  function changeModel(modelId) {
    setSelectedModelId(modelId);
    setChosenOptions({});
  }

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

      {models && models.length === 0 ? <NoModels /> : null}

      {model ? (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(320px,380px)_minmax(0,1fr)]">
          <GeneratorForm
            models={models}
            model={model}
            onModelChange={changeModel}
            prompt={prompt}
            onPromptChange={setPrompt}
            options={options}
            onOptionChange={(change) =>
              setChosenOptions({ ...chosenOptions, ...change })
            }
            balance={wallet?.balance}
            isGenerating={pendingCount > 0}
            onGenerate={generate}
          />

          <div className="flex min-w-0 flex-col gap-6">
            <GenerationResult
              generation={shownGeneration}
              pendingCount={pendingCount}
              errorMessage={errorMessage}
              onOpenImage={setOpenImage}
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
          if (!open) setOpenImage(null);
        }}
      />
    </div>
  );
}
