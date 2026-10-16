'use client';

import { useEffect, useState } from 'react';
import {
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Heart,
  Images,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/FormAlert';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetGenerationOptionsQuery } from '@/features/generations/generationsApi';
import { BulkActionBar } from '@/features/images/BulkActionBar';
import { ImagePreviewDialog } from '@/features/images/ImagePreviewDialog';
import { ImageTile } from '@/features/images/ImageTile';
import { ImageUploadDropzone } from '@/features/images/ImageUploadDropzone';
import { useGetMyImagesQuery } from '@/features/images/imagesApi';
import { useImageActions } from '@/features/images/useImageActions';
import { getErrorMessage } from '@/lib/apiError';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 24;
const ALL = 'all';

const TYPE_OPTIONS = [
  { value: 'upload', label: 'Uploaded' },
  { value: 'generated', label: 'Generated' },
  { value: 'edited', label: 'Edited' },
];

const DATE_OPTIONS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
];

function FilterSelect({ label, value, onChange, options }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 sm:w-40" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{label}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function MyCreationsView() {
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [source, setSource] = useState(ALL);
  const [modelId, setModelId] = useState(ALL);
  const [since, setSince] = useState(ALL);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [openImageId, setOpenImageId] = useState(null);
  const actions = useImageActions();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchText.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  const { data: models = [] } = useGetGenerationOptionsQuery();
  const { data, isLoading, isFetching, error } = useGetMyImagesQuery({
    page,
    limit: PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(source !== ALL ? { source } : {}),
    ...(modelId !== ALL ? { modelId } : {}),
    ...(since !== ALL ? { since } : {}),
    ...(favoritesOnly ? { favorite: true } : {}),
  });

  const images = data?.images ?? [];
  const meta = data?.meta;
  const hasFilters =
    Boolean(search) ||
    source !== ALL ||
    modelId !== ALL ||
    since !== ALL ||
    favoritesOnly;
  const openImage = images.find((image) => image.id === openImageId) ?? null;

  function changeFilter(setter) {
    return (value) => {
      setter(value);
      setPage(1);
    };
  }

  function toggleSelect(image) {
    setSelectedIds((current) =>
      current.includes(image.id)
        ? current.filter((id) => id !== image.id)
        : [...current, image.id],
    );
  }

  function stopSelecting() {
    setIsSelecting(false);
    setSelectedIds([]);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-[22px] font-semibold tracking-tight">
            My Creations
            {meta ? (
              <span className="ml-2 text-base font-normal text-muted-foreground">
                {meta.total}
              </span>
            ) : null}
          </h1>
          <p className="text-muted-foreground">
            Your private images. Only you can see them.
          </p>
        </div>
        <Button
          variant={isSelecting ? 'default' : 'outline'}
          onClick={() => (isSelecting ? stopSelecting() : setIsSelecting(true))}
          disabled={images.length === 0 && !isSelecting}
        >
          <CheckSquare />
          {isSelecting ? 'Done' : 'Select'}
        </Button>
      </div>

      <ImageUploadDropzone />

      <div className="flex flex-col gap-2 lg:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3" />
          <Input
            placeholder="Search prompts or file names"
            className="h-9 pl-9"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            aria-label="Search images"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterSelect
            label="All types"
            value={source}
            onChange={changeFilter(setSource)}
            options={TYPE_OPTIONS}
          />
          <FilterSelect
            label="All models"
            value={modelId}
            onChange={changeFilter(setModelId)}
            options={models.map((model) => ({
              value: model.id,
              label: model.name,
            }))}
          />
          <FilterSelect
            label="Any time"
            value={since}
            onChange={changeFilter(setSince)}
            options={DATE_OPTIONS}
          />
          <Button
            variant="outline"
            className={cn(
              'h-9',
              favoritesOnly && 'border-danger/50 text-danger',
            )}
            aria-pressed={favoritesOnly}
            onClick={() => changeFilter(setFavoritesOnly)(!favoritesOnly)}
          >
            <Heart className={cn(favoritesOnly && 'fill-current')} />
            Favorites
          </Button>
        </div>
      </div>

      {error ? <FormAlert>{getErrorMessage(error)}</FormAlert> : null}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((tile) => (
            <Skeleton key={tile} className="aspect-square w-full" />
          ))}
        </div>
      ) : null}

      {!isLoading && !error && images.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
          <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Images className="size-5" />
          </span>
          <p className="font-medium">
            {hasFilters ? 'No images match these filters' : 'Nothing here yet'}
          </p>
          <p className="text-sm text-muted-foreground">
            {hasFilters
              ? 'Try another search or clear the filters.'
              : 'Upload an image or create one in the Image Generator.'}
          </p>
        </div>
      ) : null}

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <ImageTile
              key={image.id}
              image={image}
              isSelecting={isSelecting}
              isSelected={selectedIds.includes(image.id)}
              onOpen={(item) => setOpenImageId(item.id)}
              onToggleSelect={toggleSelect}
              actions={actions}
            />
          ))}
        </div>
      ) : null}

      {meta && meta.totalPages > 1 ? (
        <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft />
            Previous
          </Button>
          <span>
            Page {meta.page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.totalPages || isFetching}
            onClick={() => setPage(page + 1)}
          >
            Next
            <ChevronRight />
          </Button>
        </div>
      ) : null}

      <BulkActionBar
        selectedIds={selectedIds}
        onClear={() => setSelectedIds([])}
      />

      <ImagePreviewDialog
        image={openImage}
        onOpenChange={(open) => {
          if (!open) setOpenImageId(null);
        }}
      />
    </div>
  );
}
