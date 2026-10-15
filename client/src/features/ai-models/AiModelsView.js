'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AiModelFormDialog } from '@/features/ai-models/AiModelFormDialog';
import {
  useGetAiModelsQuery,
  useUpdateAiModelStatusMutation,
} from '@/features/ai-models/aiModelsApi';
import {
  AI_MODEL_STATUSES,
  findAiModelStatus,
} from '@/features/ai-models/aiModelStatuses';
import { useGetAiProvidersQuery } from '@/features/ai-providers/aiProvidersApi';
import { getErrorMessage } from '@/lib/apiError';

const PAGE_SIZE = 10;
const ALL = 'all';

function StatusSelect({ model }) {
  const [updateStatus, { isLoading }] = useUpdateAiModelStatusMutation();
  const current = findAiModelStatus(model.status);

  async function handleChange(status) {
    try {
      await updateStatus({ id: model.id, status }).unwrap();
      toast.success(`${model.name} is now ${findAiModelStatus(status).label}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <Select
      value={model.status}
      disabled={isLoading}
      onValueChange={handleChange}
    >
      <SelectTrigger
        className="h-8 w-36"
        aria-label={`Status of ${model.name}`}
      >
        <Badge tone={current.tone}>{current.label}</Badge>
      </SelectTrigger>
      <SelectContent>
        {AI_MODEL_STATUSES.map((status) => (
          <SelectItem key={status.value} value={status.value}>
            {status.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 sm:w-44" aria-label={label}>
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

function EmptyState({ hasFilters, canAdd, onAdd }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
      <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Boxes className="size-5" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-medium">
          {hasFilters ? 'No models match these filters' : 'No models yet'}
        </p>
        <p className="text-sm text-muted-foreground">
          {canAdd
            ? 'Add a model, for example GPT Image 1 under OpenAI.'
            : 'Add a provider first, then add its models.'}
        </p>
      </div>
      {!hasFilters && canAdd ? (
        <Button onClick={onAdd}>
          <Plus />
          Add model
        </Button>
      ) : null}
    </div>
  );
}

export function AiModelsView() {
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [providerId, setProviderId] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [page, setPage] = useState(1);
  const [formState, setFormState] = useState({ open: false, model: null });

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchText.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  const { data: providers = [] } = useGetAiProvidersQuery();
  const { data, isLoading, isFetching, error } = useGetAiModelsQuery({
    page,
    limit: PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(providerId !== ALL ? { providerId } : {}),
    ...(status !== ALL ? { status } : {}),
  });

  const models = data?.models ?? [];
  const meta = data?.meta;
  const hasFilters = Boolean(search) || providerId !== ALL || status !== ALL;
  const firstRow =
    meta && meta.total > 0 ? (meta.page - 1) * meta.limit + 1 : 0;
  const lastRow = meta ? Math.min(meta.page * meta.limit, meta.total) : 0;

  function changeFilter(setter) {
    return (value) => {
      setter(value);
      setPage(1);
    };
  }

  function openCreate() {
    setFormState({ open: true, model: null });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-[22px] font-semibold tracking-tight">
            AI Models
          </h1>
          <p className="text-muted-foreground">
            Image models offered by each provider.
          </p>
        </div>
        <Button onClick={openCreate} disabled={providers.length === 0}>
          <Plus />
          Add model
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3" />
          <Input
            placeholder="Search name, slug or model ID"
            className="h-9 pl-9"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            aria-label="Search models"
          />
        </div>
        <FilterSelect
          label="All providers"
          value={providerId}
          onChange={changeFilter(setProviderId)}
          options={providers.map((provider) => ({
            value: provider.id,
            label: provider.name,
          }))}
        />
        <FilterSelect
          label="All statuses"
          value={status}
          onChange={changeFilter(setStatus)}
          options={AI_MODEL_STATUSES}
        />
      </div>

      {error ? <FormAlert>{getErrorMessage(error)}</FormAlert> : null}

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((row) => (
            <Skeleton key={row} className="h-12 w-full" />
          ))}
        </div>
      ) : null}

      {!isLoading && !error && models.length === 0 ? (
        <EmptyState
          hasFilters={hasFilters}
          canAdd={providers.length > 0}
          onAdd={openCreate}
        />
      ) : null}

      {models.length > 0 ? (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead className="hidden md:table-cell">
                  Provider model ID
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Order</TableHead>
                <TableHead className="w-14 text-right">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.id}>
                  <TableCell>
                    <Link
                      href={`/admin/models/${model.id}`}
                      className="font-medium hover:text-brand hover:underline"
                    >
                      {model.name}
                    </Link>
                    <p className="font-mono text-xs text-ink-3">{model.slug}</p>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      {model.provider.name}
                      {model.provider.isActive ? null : (
                        <Badge tone="warning">Inactive</Badge>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
                    {model.providerModelId}
                  </TableCell>
                  <TableCell>
                    <StatusSelect model={model} />
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {model.sortOrder}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit ${model.name}`}
                      onClick={() => setFormState({ open: true, model })}
                    >
                      <Pencil />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {meta && meta.total > 0 ? (
        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>
            {firstRow}–{lastRow} of {meta.total}
          </span>
          <div className="flex items-center gap-2">
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
        </div>
      ) : null}

      <AiModelFormDialog
        open={formState.open}
        model={formState.model}
        providers={providers}
        onOpenChange={(open) => setFormState({ ...formState, open })}
      />
    </div>
  );
}
