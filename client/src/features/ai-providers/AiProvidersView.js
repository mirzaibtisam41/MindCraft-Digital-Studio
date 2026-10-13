'use client';

import { useState } from 'react';
import { Pencil, Plus, Server, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/FormAlert';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AiProviderFormDialog } from '@/features/ai-providers/AiProviderFormDialog';
import { DeleteAiProviderDialog } from '@/features/ai-providers/DeleteAiProviderDialog';
import {
  useGetAiProvidersQuery,
  useUpdateAiProviderStatusMutation,
} from '@/features/ai-providers/aiProvidersApi';
import { getErrorMessage } from '@/lib/apiError';

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, { dateStyle: 'medium' });
}

function StatusSwitch({ provider }) {
  const [updateStatus, { isLoading }] = useUpdateAiProviderStatusMutation();

  async function handleChange(isActive) {
    try {
      await updateStatus({ id: provider.id, isActive }).unwrap();
      toast.success(
        `${provider.name} ${isActive ? 'activated' : 'deactivated'}`,
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={provider.isActive}
        disabled={isLoading}
        onCheckedChange={handleChange}
        aria-label={`Turn ${provider.name} ${provider.isActive ? 'off' : 'on'}`}
      />
      <Badge tone={provider.isActive ? 'success' : 'neutral'}>
        {provider.isActive ? 'Active' : 'Inactive'}
      </Badge>
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
      <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Server className="size-5" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-medium">No providers yet</p>
        <p className="text-sm text-muted-foreground">
          Add your first AI provider, for example OpenAI.
        </p>
      </div>
      <Button onClick={onAdd}>
        <Plus />
        Add provider
      </Button>
    </div>
  );
}

export function AiProvidersView() {
  const { data: providers, isLoading, error } = useGetAiProvidersQuery();
  const [formState, setFormState] = useState({ open: false, provider: null });
  const [providerToDelete, setProviderToDelete] = useState(null);

  function openCreate() {
    setFormState({ open: true, provider: null });
  }

  function openEdit(provider) {
    setFormState({ open: true, provider });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-[22px] font-semibold tracking-tight">
            AI Providers
          </h1>
          <p className="text-muted-foreground">
            Companies whose AI models power image generation.
          </p>
        </div>
        {providers?.length ? (
          <Button onClick={openCreate}>
            <Plus />
            Add provider
          </Button>
        ) : null}
      </div>

      {error ? <FormAlert>{getErrorMessage(error)}</FormAlert> : null}

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((row) => (
            <Skeleton key={row} className="h-12 w-full" />
          ))}
        </div>
      ) : null}

      {providers && providers.length === 0 ? (
        <EmptyState onAdd={openCreate} />
      ) : null}

      {providers?.length ? (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Added</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell className="font-medium">{provider.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {provider.code}
                  </TableCell>
                  <TableCell>
                    <StatusSwitch provider={provider} />
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {formatDate(provider.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${provider.name}`}
                        onClick={() => openEdit(provider)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-danger hover:text-danger"
                        aria-label={`Delete ${provider.name}`}
                        onClick={() => setProviderToDelete(provider)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      <AiProviderFormDialog
        open={formState.open}
        provider={formState.provider}
        onOpenChange={(open) => setFormState({ ...formState, open })}
      />

      <DeleteAiProviderDialog
        provider={providerToDelete}
        onOpenChange={(open) => {
          if (!open) setProviderToDelete(null);
        }}
      />
    </div>
  );
}
