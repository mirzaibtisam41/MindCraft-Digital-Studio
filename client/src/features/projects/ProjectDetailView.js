'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckSquare,
  ImageIcon,
  Pencil,
  Plus,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/FormAlert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/Spinner';
import { ImagePreviewDialog } from '@/features/images/ImagePreviewDialog';
import { ImageTile } from '@/features/images/ImageTile';
import { useImageActions } from '@/features/images/useImageActions';
import { ImagePickerDialog } from '@/features/projects/ImagePickerDialog';
import { NameDialog } from '@/features/projects/NameDialog';
import { ProjectFormDialog } from '@/features/projects/ProjectFormDialog';
import { describeProjectCounts } from '@/features/projects/projectLabels';
import {
  useCreateCollectionMutation,
  useDeleteCollectionMutation,
  useDeleteProjectMutation,
  useGetProjectImagesQuery,
  useGetProjectQuery,
  useMoveProjectImagesMutation,
  useRemoveProjectImagesMutation,
  useRenameCollectionMutation,
  useUpdateProjectMutation,
} from '@/features/projects/projectsApi';
import { getErrorMessage } from '@/lib/apiError';
import { cn } from '@/lib/utils';

const ALL = 'all';
const NO_COLLECTION = 'none';

function Chip({ isActive, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors hover:bg-accent',
        isActive && 'border-brand/60 bg-brand-tint text-brand',
      )}
    >
      {children}
    </button>
  );
}

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  isBusy,
  onConfirm,
  onOpenChange,
}) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!isBusy) onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isBusy}>Cancel</AlertDialogCancel>
          <Button variant="destructive" disabled={isBusy} onClick={onConfirm}>
            {isBusy ? <Spinner /> : null}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ProjectDetailView({ projectId }) {
  const router = useRouter();
  const actions = useImageActions();
  const [collectionFilter, setCollectionFilter] = useState(ALL);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [openImageId, setOpenImageId] = useState(null);
  const [dialog, setDialog] = useState(null);

  const project = useGetProjectQuery(projectId);
  const imagesQuery = useGetProjectImagesQuery({
    projectId,
    page: 1,
    limit: 100,
    ...(collectionFilter !== ALL ? { collectionId: collectionFilter } : {}),
  });
  const [updateProject] = useUpdateProjectMutation();
  const [deleteProject, deleteProjectState] = useDeleteProjectMutation();
  const [removeImages, removeState] = useRemoveProjectImagesMutation();
  const [moveImages] = useMoveProjectImagesMutation();
  const [createCollection] = useCreateCollectionMutation();
  const [renameCollection] = useRenameCollectionMutation();
  const [deleteCollection, deleteCollectionState] =
    useDeleteCollectionMutation();

  const images = imagesQuery.data?.images ?? [];
  const collections = project.data?.collections ?? [];
  const activeCollection = collections.find(
    (collection) => collection.id === collectionFilter,
  );
  const openImage = images.find((image) => image.id === openImageId) ?? null;
  const cover = project.data?.previewImages?.[0];
  const error = project.error ?? imagesQuery.error;

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

  async function run(task, successMessage) {
    try {
      await task();
      if (successMessage) toast.success(successMessage);
      return true;
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
      return false;
    }
  }

  async function setCover() {
    const done = await run(
      () => updateProject({ projectId, coverImageId: selectedIds[0] }).unwrap(),
      'Cover updated',
    );
    if (done) stopSelecting();
  }

  async function moveSelected(value) {
    const collectionId = value === NO_COLLECTION ? null : value;
    const done = await run(
      () =>
        moveImages({ projectId, imageIds: selectedIds, collectionId }).unwrap(),
      collectionId ? 'Moved to the collection' : 'Removed from the collection',
    );
    if (done) stopSelecting();
  }

  async function removeSelected() {
    const done = await run(
      () => removeImages({ projectId, imageIds: selectedIds }).unwrap(),
      `${selectedIds.length} removed from the project`,
    );
    if (done) {
      setDialog(null);
      stopSelecting();
    }
  }

  async function handleDeleteProject() {
    const done = await run(
      () => deleteProject(projectId).unwrap(),
      'Project deleted',
    );
    if (done) router.push('/app/projects');
  }

  async function handleDeleteCollection() {
    const done = await run(
      () =>
        deleteCollection({
          projectId,
          collectionId: activeCollection.id,
        }).unwrap(),
      'Collection deleted. Its images stay in the project.',
    );
    if (done) {
      setDialog(null);
      setCollectionFilter(ALL);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/app/projects"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All projects
      </Link>

      {error ? <FormAlert>{getErrorMessage(error)}</FormAlert> : null}
      {project.isLoading ? <Skeleton className="h-24 w-full" /> : null}

      {project.data ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted text-ink-3">
                {cover ? (
                  <img
                    src={cover.thumbnailUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <ImageIcon className="size-6" />
                )}
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <h1 className="truncate text-[22px] font-semibold tracking-tight">
                  {project.data.name}
                </h1>
                {project.data.description ? (
                  <p className="text-muted-foreground">
                    {project.data.description}
                  </p>
                ) : null}
                <p className="font-mono text-xs text-ink-3">
                  {describeProjectCounts(project.data)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setDialog('editProject')}
              >
                <Pencil />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={() => setDialog('deleteProject')}
              >
                <Trash2 />
                Delete
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Chip
              isActive={collectionFilter === ALL}
              onClick={() => setCollectionFilter(ALL)}
            >
              All
              <span className="text-xs text-ink-3">
                {project.data.imageCount}
              </span>
            </Chip>
            {collections.map((collection) => (
              <Chip
                key={collection.id}
                isActive={collectionFilter === collection.id}
                onClick={() => setCollectionFilter(collection.id)}
              >
                {collection.name}
                <span className="text-xs text-ink-3">
                  {collection.imageCount}
                </span>
              </Chip>
            ))}
            <Chip isActive={false} onClick={() => setDialog('newCollection')}>
              <Plus className="size-3.5" />
              New collection
            </Chip>
            {activeCollection ? (
              <div className="ml-auto flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDialog('renameCollection')}
                >
                  Rename
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDialog('deleteCollection')}
                >
                  Delete collection
                </Button>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {imagesQuery.data
                ? `${imagesQuery.data.meta.total} ${imagesQuery.data.meta.total === 1 ? 'image' : 'images'}${activeCollection ? ` in ${activeCollection.name}` : ''}`
                : ''}
            </p>
            <Button
              variant={isSelecting ? 'default' : 'outline'}
              size="sm"
              disabled={images.length === 0 && !isSelecting}
              onClick={() =>
                isSelecting ? stopSelecting() : setIsSelecting(true)
              }
            >
              <CheckSquare />
              {isSelecting ? 'Done' : 'Select'}
            </Button>
          </div>

          {imagesQuery.isLoading ? <Skeleton className="h-48 w-full" /> : null}

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
            {isSelecting ? null : (
              <button
                type="button"
                onClick={() => setDialog('pickImages')}
                className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-sm text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground"
              >
                <Plus className="size-5" />
                Add from My Creations
              </button>
            )}
          </div>

          {selectedIds.length > 0 ? (
            <div className="sticky bottom-4 z-20 mx-auto flex w-fit max-w-full flex-wrap items-center gap-2 rounded-xl border bg-popover p-2 pl-4 shadow-lg">
              <span className="text-sm font-medium">
                {selectedIds.length} selected
              </span>
              {selectedIds.length === 1 ? (
                <Button variant="outline" size="sm" onClick={setCover}>
                  <Star />
                  Set as cover
                </Button>
              ) : null}
              {collections.length > 0 ? (
                <Select value="" onValueChange={moveSelected}>
                  <SelectTrigger
                    className="h-8 w-44"
                    aria-label="Move to collection"
                  >
                    <SelectValue placeholder="Move to…" />
                  </SelectTrigger>
                  <SelectContent>
                    {collections.map((collection) => (
                      <SelectItem key={collection.id} value={collection.id}>
                        {collection.name}
                      </SelectItem>
                    ))}
                    <SelectItem value={NO_COLLECTION}>No collection</SelectItem>
                  </SelectContent>
                </Select>
              ) : null}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDialog('removeImages')}
              >
                <Trash2 />
                Remove from project
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds([])}
              >
                <X />
                Clear
              </Button>
            </div>
          ) : null}
        </>
      ) : null}

      <ProjectFormDialog
        open={dialog === 'editProject'}
        project={project.data}
        onOpenChange={(open) => setDialog(open ? 'editProject' : null)}
      />

      <NameDialog
        open={dialog === 'newCollection'}
        title="New collection"
        label="Collection name"
        submitLabel="Create collection"
        onOpenChange={(open) => setDialog(open ? 'newCollection' : null)}
        onSubmit={async (name) => {
          const collection = await createCollection({
            projectId,
            name,
          }).unwrap();
          toast.success('Collection created');
          setDialog(null);
          setCollectionFilter(collection.id);
        }}
      />

      <NameDialog
        open={dialog === 'renameCollection'}
        title="Rename collection"
        label="Collection name"
        initialName={activeCollection?.name}
        submitLabel="Save name"
        onOpenChange={(open) => setDialog(open ? 'renameCollection' : null)}
        onSubmit={async (name) => {
          await renameCollection({
            projectId,
            collectionId: activeCollection.id,
            name,
          }).unwrap();
          toast.success('Collection renamed');
          setDialog(null);
        }}
      />

      <ConfirmDialog
        open={dialog === 'deleteProject'}
        title={`Delete ${project.data?.name ?? 'this project'}?`}
        description="The project and its collections are removed. Your images stay in My Creations."
        confirmLabel="Delete project"
        isBusy={deleteProjectState.isLoading}
        onConfirm={handleDeleteProject}
        onOpenChange={(open) => setDialog(open ? 'deleteProject' : null)}
      />

      <ConfirmDialog
        open={dialog === 'deleteCollection'}
        title={`Delete ${activeCollection?.name ?? 'this collection'}?`}
        description="Its images stay in the project, just without a collection."
        confirmLabel="Delete collection"
        isBusy={deleteCollectionState.isLoading}
        onConfirm={handleDeleteCollection}
        onOpenChange={(open) => setDialog(open ? 'deleteCollection' : null)}
      />

      <ConfirmDialog
        open={dialog === 'removeImages'}
        title={`Remove ${selectedIds.length} from this project?`}
        description="They stay in My Creations and in any other project."
        confirmLabel="Remove"
        isBusy={removeState.isLoading}
        onConfirm={removeSelected}
        onOpenChange={(open) => setDialog(open ? 'removeImages' : null)}
      />

      <ImagePickerDialog
        open={dialog === 'pickImages'}
        projectId={projectId}
        collectionId={activeCollection?.id ?? null}
        existingIds={images.map((image) => image.id)}
        onOpenChange={(open) => setDialog(open ? 'pickImages' : null)}
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
