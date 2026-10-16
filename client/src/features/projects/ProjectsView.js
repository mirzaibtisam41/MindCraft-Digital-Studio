'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FolderKanban, ImageIcon, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/FormAlert';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ProjectFormDialog } from '@/features/projects/ProjectFormDialog';
import { describeProjectCounts } from '@/features/projects/projectLabels';
import { useGetProjectsQuery } from '@/features/projects/projectsApi';
import { getErrorMessage } from '@/lib/apiError';

function Mosaic({ images }) {
  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center bg-muted text-ink-3">
        <ImageIcon className="size-8" />
      </div>
    );
  }

  return (
    <div className="grid aspect-[4/3] grid-cols-2 grid-rows-2 gap-0.5 bg-muted">
      {[0, 1, 2, 3].map((index) =>
        images[index] ? (
          <img
            key={images[index].id}
            src={images[index].thumbnailUrl}
            alt=""
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <div key={index} className="bg-muted" />
        ),
      )}
    </div>
  );
}

export function ProjectsView() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchText.trim()), 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  const { data, isLoading, error } = useGetProjectsQuery({
    page: 1,
    limit: 50,
    ...(search ? { search } : {}),
  });
  const projects = data?.projects ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-[22px] font-semibold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Group your images by campaign, client or idea.
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus />
          New project
        </Button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3" />
        <Input
          placeholder="Search projects"
          className="h-9 pl-9"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          aria-label="Search projects"
        />
      </div>

      {error ? <FormAlert>{getErrorMessage(error)}</FormAlert> : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((card) => (
            <Skeleton key={card} className="aspect-[4/3] w-full" />
          ))}
        </div>
      ) : null}

      {!isLoading && search && projects.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          No projects match “{search}”.
        </p>
      ) : null}

      {!isLoading && !error ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/app/projects/${project.id}`}
              className="overflow-hidden rounded-xl border bg-card transition-colors hover:border-brand/40"
            >
              <Mosaic images={project.previewImages} />
              <div className="flex flex-col gap-1 p-3">
                <p className="truncate font-medium">{project.name}</p>
                <p className="text-xs text-ink-3">
                  {describeProjectCounts(project)}
                </p>
              </div>
            </Link>
          ))}
          {search ? null : (
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground"
            >
              <FolderKanban className="size-6" />
              Create project
            </button>
          )}
        </div>
      ) : null}

      <ProjectFormDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        onSaved={(project) => router.push(`/app/projects/${project.id}`)}
      />
    </div>
  );
}
