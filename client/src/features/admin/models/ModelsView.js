'use client';

import Link from 'next/link';
import { ChevronRight, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  EmptyState,
  ErrorState,
  TableSkeleton,
} from '@/components/ui/DataState';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { IMAGE_PROVIDER_OPTIONS } from '@/constants/admin';
import { useGetAdminModelsQuery } from '@/features/admin/adminApi';
import { ModelStatusSwitch } from '@/features/admin/models/ModelStatusSwitch';
import { formatDate } from '@/lib/formatDate';

const PROVIDER_LABELS = Object.fromEntries(
  IMAGE_PROVIDER_OPTIONS.map(({ value, label }) => [value, label]),
);

function CreditPrices({ model }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {model.capabilities.qualities.map((quality) => (
        <li key={quality}>
          <Badge className="font-mono">
            {quality} · {model.creditsPerImage[quality] ?? '—'}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

function AddModelButton() {
  return (
    <Button asChild>
      <Link href="/admin/models/new">
        <Plus />
        Add model
      </Link>
    </Button>
  );
}

export function ModelsView() {
  const { data, isLoading, isFetching, error, refetch } =
    useGetAdminModelsQuery();
  const models = data?.models ?? [];
  const enabledCount = models.filter((model) => model.enabled).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Models & pricing"
        description={
          data
            ? `${models.length} models · ${enabledCount} enabled. Prices and options apply to new generations immediately.`
            : 'Add models, enable or disable them, set credit prices and limit which options users can pick.'
        }
        actions={<AddModelButton />}
      />

      <div className="rounded-xl border bg-card" aria-busy={isFetching}>
        {isLoading ? <TableSkeleton rows={4} /> : null}
        {error ? <ErrorState error={error} onRetry={refetch} /> : null}
        {data && models.length === 0 ? (
          <div className="flex flex-col items-center gap-3 pb-10">
            <EmptyState
              title="No image models yet"
              description="Add a model so users can start generating images."
            />
            <AddModelButton />
          </div>
        ) : null}
        {models.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Model</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Credits per image</TableHead>
                <TableHead className="text-right">Sizes</TableHead>
                <TableHead className="text-right">Max images</TableHead>
                <TableHead className="text-right">Order</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Enabled</TableHead>
                <TableHead>
                  <span className="sr-only">Open</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.id}>
                  <TableCell>
                    <Link
                      href={`/admin/models/${encodeURIComponent(model.id)}`}
                      className="flex flex-col outline-none hover:underline focus-visible:underline"
                    >
                      <span className="font-medium">{model.label}</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {model.id}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {PROVIDER_LABELS[model.provider] ?? model.provider}
                  </TableCell>
                  <TableCell>
                    <CreditPrices model={model} />
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {model.capabilities.sizes.length}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {model.capabilities.maxImagesPerRequest}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {model.sortOrder}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(model.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <ModelStatusSwitch model={model} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="icon-sm">
                      <Link
                        href={`/admin/models/${encodeURIComponent(model.id)}`}
                        aria-label={`Open ${model.label}`}
                      >
                        <ChevronRight />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
      </div>
    </div>
  );
}
