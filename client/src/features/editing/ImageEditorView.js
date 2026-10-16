'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Brush,
  Download,
  Eraser,
  Redo2,
  RefreshCw,
  Sparkles,
  Trash2,
  Undo2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/FormAlert';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/Spinner';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useGetMyWalletQuery } from '@/features/credits/walletApi';
import { EditHistoryPanel } from '@/features/editing/EditHistoryPanel';
import { MaskCanvas, buildMaskDataUrl } from '@/features/editing/MaskCanvas';
import { SourceImagePanel } from '@/features/editing/SourceImagePanel';
import { findClosestSize } from '@/features/editing/imageSizes';
import { QUALITY_LABELS } from '@/features/generations/generationLabels';
import { NoModels } from '@/features/generations/NoModels';
import {
  useCreateGenerationMutation,
  useGetGenerationOptionsQuery,
} from '@/features/generations/generationsApi';
import { useGeneratorOptions } from '@/features/generations/useGeneratorOptions';
import { useGetImageQuery } from '@/features/images/imagesApi';
import { useImageActions } from '@/features/images/useImageActions';
import { getErrorMessage } from '@/lib/apiError';
import { cn } from '@/lib/utils';

const PRESETS = [
  {
    label: 'Remove object',
    prompt:
      'Remove the object in the painted area and fill it so it blends with its surroundings.',
  },
  {
    label: 'Replace background',
    prompt: 'Replace the background in the painted area with ',
  },
  {
    label: 'Change color',
    prompt: 'Change the color of the painted area to ',
  },
];

const OPTION_ITEM_CLASSES =
  'h-auto flex-1 flex-col gap-0 py-1.5 data-[state=on]:bg-brand-tint data-[state=on]:text-brand data-[state=on]:ring-1 data-[state=on]:ring-brand/60';

function EmptyEditor({ onChoose }) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 rounded-xl border bg-card p-6">
      <div className="flex flex-col gap-1 text-center">
        <p className="font-medium">Choose an image to start editing</p>
        <p className="text-sm text-muted-foreground">
          Paint over the part you want to change, then describe the change. Your
          image stays private.
        </p>
      </div>
      <SourceImagePanel label="Image" image={null} onChange={onChoose} />
    </div>
  );
}

export function ImageEditorView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const actions = useImageActions();
  const imageId = searchParams.get('imageId');

  const [strokes, setStrokes] = useState([]);
  const [undoneStrokes, setUndoneStrokes] = useState([]);
  const [mode, setMode] = useState('paint');
  const [brushSize, setBrushSize] = useState(60);
  const [view, setView] = useState('edit');
  const [prompt, setPrompt] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    data: image,
    isLoading: isLoadingImage,
    error: imageError,
  } = useGetImageQuery(imageId, { skip: !imageId });
  const { data: models, isLoading: isLoadingModels } =
    useGetGenerationOptionsQuery('image_edit');
  const { data: wallet } = useGetMyWalletQuery();
  const [createGeneration] = useCreateGenerationMutation();

  const matchingSize =
    image && models?.[0]
      ? findClosestSize({
          sizes: models[0].enabledOptions.sizes,
          width: image.width,
          height: image.height,
        })
      : null;
  const { model, options, changeModel, changeOption } = useGeneratorOptions({
    models,
    preferredOptions: { size: matchingSize, n: 1, outputFormat: 'png' },
  });

  const hasMask = strokes.some((stroke) => stroke.mode === 'paint');
  const cost = model ? model.prices[options.quality] * options.n : 0;
  const hasEnoughCredits = wallet === undefined || wallet.balance >= cost;
  const canApply =
    hasMask && prompt.trim() && hasEnoughCredits && !isApplying && model;

  function openImage(nextImageId) {
    setStrokes([]);
    setUndoneStrokes([]);
    setErrorMessage('');
    setView('edit');
    router.replace(`/app/editor?imageId=${nextImageId}`);
  }

  function addStroke(stroke) {
    setStrokes((current) => [...current, stroke]);
    setUndoneStrokes([]);
  }

  function undo() {
    if (strokes.length === 0) return;

    setUndoneStrokes((current) => [...current, strokes.at(-1)]);
    setStrokes((current) => current.slice(0, -1));
  }

  function redo() {
    if (undoneStrokes.length === 0) return;

    setStrokes((current) => [...current, undoneStrokes.at(-1)]);
    setUndoneStrokes((current) => current.slice(0, -1));
  }

  async function applyEdit(event) {
    event.preventDefault();

    if (!canApply) return;

    setIsApplying(true);
    setErrorMessage('');

    try {
      const generation = await createGeneration({
        type: 'image_edit',
        modelId: model.id,
        sourceImageId: image.id,
        mask: buildMaskDataUrl({
          width: image.width,
          height: image.height,
          strokes,
        }),
        prompt: prompt.trim(),
        options,
      }).unwrap();

      toast.success('Edit applied');
      setPrompt('');
      openImage(generation.images[0].id);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsApplying(false);
    }
  }

  if (!imageId) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-[22px] font-semibold tracking-tight">
            Image Editor
          </h1>
          <p className="text-muted-foreground">
            Change parts of an image with a simple instruction.
          </p>
        </div>
        <EmptyEditor onChoose={(chosen) => chosen && openImage(chosen.id)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-[22px] font-semibold tracking-tight">
            Image Editor
          </h1>
          <p className="truncate text-sm text-muted-foreground">
            {image
              ? `${image.originalFileName ?? image.prompt ?? 'Image'} · ${image.width} × ${image.height}`
              : ' '}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/app/editor')}
          >
            <RefreshCw />
            Change image
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!image}
            onClick={() => actions.download(image)}
          >
            <Download />
            Export
          </Button>
        </div>
      </div>

      {imageError ? <FormAlert>{getErrorMessage(imageError)}</FormAlert> : null}
      {isLoadingImage || isLoadingModels ? (
        <Skeleton className="h-96 w-full" />
      ) : null}
      {models && models.length === 0 ? (
        <NoModels message="An admin needs to turn on Image Editing for a model first." />
      ) : null}

      {image && model ? (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]">
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-2">
              <ToggleGroup
                type="single"
                variant="outline"
                value={mode}
                onValueChange={(next) => next && setMode(next)}
              >
                <ToggleGroupItem
                  value="paint"
                  aria-label="Paint mask"
                  className="data-[state=on]:bg-brand-tint data-[state=on]:text-brand"
                >
                  <Brush />
                  Paint
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="erase"
                  aria-label="Erase mask"
                  className="data-[state=on]:bg-brand-tint data-[state=on]:text-brand"
                >
                  <Eraser />
                  Erase
                </ToggleGroupItem>
              </ToggleGroup>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                Brush
                <input
                  type="range"
                  min={10}
                  max={200}
                  value={brushSize}
                  onChange={(event) => setBrushSize(Number(event.target.value))}
                  aria-label="Brush size"
                  className="w-24 accent-[var(--brand)]"
                />
              </label>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Undo"
                disabled={strokes.length === 0}
                onClick={undo}
              >
                <Undo2 />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Redo"
                disabled={undoneStrokes.length === 0}
                onClick={redo}
              >
                <Redo2 />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={strokes.length === 0}
                onClick={() => {
                  setStrokes([]);
                  setUndoneStrokes([]);
                }}
              >
                <Trash2 />
                Clear mask
              </Button>
              <span className="ml-auto text-xs text-ink-3">
                {hasMask ? 'Masking · ready' : 'Paint the area to change'}
              </span>
            </div>

            <MaskCanvas
              image={image}
              strokes={strokes}
              mode={mode}
              brushSize={brushSize}
              isDisabled={isApplying || view === 'clean'}
              showMask={view === 'edit'}
              onStrokeEnd={addStroke}
            />

            <div className="flex justify-center">
              <ToggleGroup
                type="single"
                variant="outline"
                value={view}
                onValueChange={(next) => next && setView(next)}
              >
                <ToggleGroupItem value="edit" aria-label="Show mask">
                  Show mask
                </ToggleGroupItem>
                <ToggleGroupItem value="clean" aria-label="Hide mask">
                  Hide mask
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <form
              onSubmit={applyEdit}
              className="flex flex-col gap-4 rounded-xl border bg-card p-4"
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-instruction">Instruction</Label>
                <Textarea
                  id="edit-instruction"
                  rows={4}
                  maxLength={2000}
                  placeholder="Add a red hat"
                  value={prompt}
                  disabled={isApplying}
                  onChange={(event) => setPrompt(event.target.value)}
                />
                <div className="flex flex-wrap gap-1.5">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      disabled={isApplying}
                      onClick={() => setPrompt(preset.prompt)}
                      className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {models.length > 1 ? (
                <div className="flex flex-col gap-2">
                  <Label>Model</Label>
                  <Select value={model.id} onValueChange={changeModel}>
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
                </div>
              ) : null}

              <div className="flex flex-col gap-2">
                <Label>Quality</Label>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={options.quality}
                  disabled={isApplying}
                  onValueChange={(quality) =>
                    quality && changeOption({ quality })
                  }
                  className="w-full"
                >
                  {model.enabledOptions.qualities.map((quality) => (
                    <ToggleGroupItem
                      key={quality}
                      value={quality}
                      aria-label={QUALITY_LABELS[quality] ?? quality}
                      className={OPTION_ITEM_CLASSES}
                    >
                      <span>{QUALITY_LABELS[quality] ?? quality}</span>
                      <span className="text-[11px] text-ink-3">
                        {model.prices[quality]} cr
                      </span>
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              <FormAlert>{errorMessage}</FormAlert>

              <div className="flex flex-col gap-1">
                <Button type="submit" disabled={!canApply}>
                  {isApplying ? <Spinner /> : <Sparkles />}
                  {isApplying ? 'Applying…' : `Apply edit · ${cost} cr`}
                </Button>
                <p
                  className={cn(
                    'text-center text-xs text-ink-3',
                    !hasEnoughCredits && 'text-danger',
                  )}
                >
                  {!hasEnoughCredits
                    ? `You have ${wallet.balance} credits`
                    : hasMask
                      ? 'Changes only the painted area. The original stays in history.'
                      : 'Paint over the area you want to change first.'}
                </p>
              </div>
            </form>

            <EditHistoryPanel imageId={image.id} onSelect={openImage} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
