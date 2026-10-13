'use client';

import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
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
import { DeleteGenerationTypeDialog } from '@/features/generation-types/DeleteGenerationTypeDialog';
import { GenerationTypeFormDialog } from '@/features/generation-types/GenerationTypeFormDialog';
import {
  useGetGenerationTypesQuery,
  useUpdateGenerationTypeStatusMutation,
} from '@/features/generation-types/generationTypesApi';
import { getErrorMessage } from '@/lib/apiError';

function StatusSwitch({ generationType }) {
  const [updateStatus, { isLoading }] = useUpdateGenerationTypeStatusMutation();

  async function handleChange(isActive) {
    try {
      await updateStatus({ id: generationType.id, isActive }).unwrap();
      toast.success(
        `${generationType.name} ${isActive ? 'turned on' : 'turned off'}`,
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={generationType.isActive}
        disabled={isLoading}
        onCheckedChange={handleChange}
        aria-label={`Turn ${generationType.name} ${generationType.isActive ? 'off' : 'on'}`}
      />
      <Badge tone={generationType.isActive ? 'success' : 'neutral'}>
        {generationType.isActive ? 'On' : 'Off'}
      </Badge>
    </div>
  );
}

export function GenerationTypesView() {
  const {
    data: generationTypes,
    isLoading,
    error,
  } = useGetGenerationTypesQuery();
  const [formState, setFormState] = useState({
    open: false,
    generationType: null,
  });
  const [typeToDelete, setTypeToDelete] = useState(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-[22px] font-semibold tracking-tight">
            Generation Types
          </h1>
          <p className="text-muted-foreground">
            The image workflows MindCraft offers. Turning one off makes it
            unavailable for every model.
          </p>
        </div>
        <Button
          onClick={() => setFormState({ open: true, generationType: null })}
        >
          <Plus />
          Add generation type
        </Button>
      </div>

      {error ? <FormAlert>{getErrorMessage(error)}</FormAlert> : null}

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((row) => (
            <Skeleton key={row} className="h-12 w-full" />
          ))}
        </div>
      ) : null}

      {generationTypes?.length ? (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Code</TableHead>
                <TableHead className="hidden md:table-cell">
                  Description
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {generationTypes.map((generationType) => (
                <TableRow key={generationType.id}>
                  <TableCell className="font-medium">
                    {generationType.name}
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs text-muted-foreground sm:table-cell">
                    {generationType.code}
                  </TableCell>
                  <TableCell className="hidden max-w-80 truncate text-muted-foreground md:table-cell">
                    {generationType.description ?? '—'}
                  </TableCell>
                  <TableCell>
                    <StatusSwitch generationType={generationType} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${generationType.name}`}
                        onClick={() =>
                          setFormState({ open: true, generationType })
                        }
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-danger hover:text-danger"
                        aria-label={`Delete ${generationType.name}`}
                        onClick={() => setTypeToDelete(generationType)}
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

      <GenerationTypeFormDialog
        open={formState.open}
        generationType={formState.generationType}
        onOpenChange={(open) => setFormState({ ...formState, open })}
      />

      <DeleteGenerationTypeDialog
        generationType={typeToDelete}
        onOpenChange={(open) => {
          if (!open) setTypeToDelete(null);
        }}
      />
    </div>
  );
}
