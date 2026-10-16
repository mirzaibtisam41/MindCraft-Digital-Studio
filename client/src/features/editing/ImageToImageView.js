'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { FormAlert } from '@/components/ui/FormAlert';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetMyWalletQuery } from '@/features/credits/walletApi';
import { SourceImagePanel } from '@/features/editing/SourceImagePanel';
import { findClosestSize } from '@/features/editing/imageSizes';
import { GenerationResult } from '@/features/generations/GenerationResult';
import { GeneratorForm } from '@/features/generations/GeneratorForm';
import { NoModels } from '@/features/generations/NoModels';
import {
  useCreateGenerationMutation,
  useGetGenerationOptionsQuery,
} from '@/features/generations/generationsApi';
import { useGeneratorOptions } from '@/features/generations/useGeneratorOptions';
import { ImagePreviewDialog } from '@/features/images/ImagePreviewDialog';
import { useGetImageQuery } from '@/features/images/imagesApi';
import { getErrorMessage } from '@/lib/apiError';

export function ImageToImageView() {
  const searchParams = useSearchParams();
  const [sourceImageId, setSourceImageId] = useState(() =>
    searchParams.get('imageId'),
  );
  const [pickedImage, setPickedImage] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState(null);
  const [openImageId, setOpenImageId] = useState(null);

  const {
    data: models,
    isLoading,
    error,
  } = useGetGenerationOptionsQuery('image_to_image');
  const { data: wallet } = useGetMyWalletQuery();
  const { data: loadedImage } = useGetImageQuery(sourceImageId, {
    skip: !sourceImageId || pickedImage?.id === sourceImageId,
  });
  const [createGeneration] = useCreateGenerationMutation();
  const sourceImage =
    pickedImage?.id === sourceImageId ? pickedImage : (loadedImage ?? null);

  const firstModel = models?.[0];
  const matchingSize =
    sourceImage && firstModel
      ? findClosestSize({
          sizes: firstModel.enabledOptions.sizes,
          width: sourceImage.width,
          height: sourceImage.height,
        })
      : null;
  const { model, options, changeModel, changeOption } = useGeneratorOptions({
    models,
    preferredOptions: { size: matchingSize },
  });
  const openImage =
    result?.images.find((image) => image.id === openImageId) ?? null;

  function chooseImage(image) {
    setPickedImage(image);
    setSourceImageId(image?.id ?? null);
    setResult(null);
  }

  async function transform() {
    setErrorMessage('');
    setPendingCount(options.n);

    try {
      const generation = await createGeneration({
        type: 'image_to_image',
        modelId: model.id,
        sourceImageId: sourceImage.id,
        prompt: prompt.trim(),
        options,
      }).unwrap();

      setResult(generation);
      toast.success(
        generation.images.length === 1
          ? 'Variation created'
          : `${generation.images.length} variations created`,
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
          Image to Image
        </h1>
        <p className="text-muted-foreground">
          Start from one of your images and describe how the new versions should
          look.
        </p>
      </div>

      {error ? <FormAlert>{getErrorMessage(error)}</FormAlert> : null}
      {isLoading ? <Skeleton className="h-96 w-full" /> : null}
      {models && models.length === 0 ? (
        <NoModels message="An admin needs to turn on Image to Image for a model first." />
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
            onGenerate={transform}
            isReady={Boolean(sourceImage)}
            promptPlaceholder="Turn it into a soft watercolor painting"
            submitLabel={`Transform — ${options.n} ${options.n === 1 ? 'variation' : 'variations'}`}
          >
            <SourceImagePanel
              label="Reference image"
              image={sourceImage}
              onChange={chooseImage}
              isDisabled={pendingCount > 0}
            />
          </GeneratorForm>

          <div className="flex min-w-0 flex-col gap-6">
            {sourceImage && (result || pendingCount > 0) ? (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <img
                  src={sourceImage.thumbnailUrl}
                  alt="Reference"
                  className="size-12 rounded-md border object-cover"
                />
                <ArrowRight className="size-4" />
                <span>
                  {pendingCount > 0 ? 'Creating variations' : 'Variations'}
                </span>
              </div>
            ) : null}
            <GenerationResult
              generation={result}
              pendingCount={pendingCount}
              errorMessage={errorMessage}
              onOpenImage={(image) => setOpenImageId(image.id)}
              onClose={() => {
                setErrorMessage('');
                setResult(null);
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
