'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
  ArrowRight,
  FolderKanban,
  ImageIcon,
  ImagePlus,
  NotebookPen,
  ScanEye,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { ImagePreviewDialog } from '@/features/images/ImagePreviewDialog';
import { ImageTile } from '@/features/images/ImageTile';
import { useGetMyImagesQuery } from '@/features/images/imagesApi';
import { useImageActions } from '@/features/images/useImageActions';
import { describeProjectCounts } from '@/features/projects/projectLabels';
import { useGetProjectsQuery } from '@/features/projects/projectsApi';
import {
  ChangeBadge,
  CreditsDonut,
  DailyBarChart,
} from '@/features/usage/UsageCharts';
import { useGetMyUsageQuery } from '@/features/usage/usageApi';
import { formatMonth } from '@/features/usage/usageLabels';

const QUICK_ACTIONS = [
  {
    label: 'Image Editor',
    description: 'Paint a mask and change part of an image.',
    href: '/app/editor',
    icon: Wand2,
  },
  {
    label: 'Image to Image',
    description: 'Start from a picture and transform it.',
    href: '/app/image-to-image',
    icon: ImageIcon,
  },
  {
    label: 'AI Vision',
    description: 'Describe, read text or analyze a design.',
    href: '/app/vision',
    icon: ScanEye,
  },
];

function greet() {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';

  return 'Good evening';
}

function SectionHeader({ title, href, linkLabel }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-[16px] font-semibold">{title}</h2>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        {linkLabel}
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

function QuickPromptBar() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    const text = prompt.trim();
    router.push(
      text
        ? `/app/generate?${new URLSearchParams({ prompt: text })}`
        : '/app/generate',
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:items-center"
    >
      <Sparkles className="hidden size-5 shrink-0 text-brand sm:block" />
      <Input
        aria-label="Describe an image"
        placeholder="Describe an image you want to create…"
        maxLength={2000}
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        className="border-0 bg-transparent shadow-none focus-visible:ring-0"
      />
      <Button type="submit" className="shrink-0">
        <ImagePlus />
        Generate
      </Button>
    </form>
  );
}

function RecentCreations() {
  const [openImageId, setOpenImageId] = useState(null);
  const { data, isLoading } = useGetMyImagesQuery({ page: 1, limit: 8 });
  const actions = useImageActions();
  const images = data?.images ?? [];
  const openImage = images.find((image) => image.id === openImageId) ?? null;

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader
        title="Recent creations"
        href="/app/creations"
        linkLabel="View all"
      />
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="aspect-square" />
          ))}
        </div>
      ) : null}
      {!isLoading && images.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center">
          <ImageIcon className="size-8 text-ink-3" />
          <p className="font-medium">Nothing here yet</p>
          <Button asChild>
            <Link href="/app/generate">Create image</Link>
          </Button>
        </div>
      ) : null}
      {images.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((image) => (
            <ImageTile
              key={image.id}
              image={image}
              onOpen={(item) => setOpenImageId(item.id)}
              actions={actions}
            />
          ))}
        </div>
      ) : null}
      <ImagePreviewDialog
        image={openImage}
        onOpenChange={(open) => {
          if (!open) setOpenImageId(null);
        }}
      />
    </section>
  );
}

function RecentProjects() {
  const { data, isLoading } = useGetProjectsQuery({ page: 1, limit: 3 });
  const projects = data?.projects ?? [];

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader
        title="Recent projects"
        href="/app/projects"
        linkLabel="All projects"
      />
      {isLoading ? <Skeleton className="h-20" /> : null}
      {!isLoading && projects.length === 0 ? (
        <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
          Group images for a campaign or client in a project.
        </p>
      ) : null}
      <div className="grid gap-3 md:grid-cols-3">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/app/projects/${project.id}`}
            className="flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:border-brand/40"
          >
            {project.previewImages[0] ? (
              <img
                src={project.previewImages[0].thumbnailUrl}
                alt=""
                className="size-12 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-ink-3">
                <FolderKanban className="size-5" />
              </span>
            )}
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-medium">{project.name}</span>
              <span className="truncate text-xs text-ink-3">
                {describeProjectCounts(project)}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function DashboardView() {
  const user = useSelector(selectCurrentUser);
  const { data: usage } = useGetMyUsageQuery({});

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[22px] font-semibold tracking-tight">
            {greet()}, {user.name.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground">
            {usage
              ? `${usage.imagesGenerated} ${usage.imagesGenerated === 1 ? 'image' : 'images'} created in ${formatMonth(usage.month)}.`
              : 'Your creative workspace.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/app/prompts">
              <NotebookPen />
              Browse prompts
            </Link>
          </Button>
          <Button asChild>
            <Link href="/app/generate">
              <ImagePlus />
              Create image
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          <QuickPromptBar />

          <div className="grid gap-3 sm:grid-cols-3">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col gap-2 rounded-xl border bg-card p-4 transition-colors hover:border-brand/40"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-brand-tint text-brand">
                  <action.icon className="size-4" />
                </span>
                <span className="font-medium">{action.label}</span>
                <span className="text-xs text-muted-foreground">
                  {action.description}
                </span>
              </Link>
            ))}
          </div>

          <RecentCreations />
          <RecentProjects />
        </div>

        <aside className="flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-[15px] font-semibold">Images this month</h2>
                {usage ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-2xl font-semibold">
                      {usage.imagesGenerated}
                    </span>
                    <ChangeBadge
                      current={usage.imagesGenerated}
                      previous={usage.previousImagesGenerated}
                    />
                  </div>
                ) : null}
              </div>
              {usage ? (
                <DailyBarChart
                  days={usage.days}
                  today={usage.today}
                  valueKey="images"
                  unit="images"
                />
              ) : (
                <Skeleton className="h-36" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-4">
              <h2 className="text-[15px] font-semibold">Credits</h2>
              {usage ? (
                <CreditsDonut
                  used={usage.creditsUsed}
                  balance={usage.balance}
                />
              ) : (
                <Skeleton className="h-28" />
              )}
              <Button asChild variant="outline" size="sm">
                <Link href="/app/credits">See usage details</Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
