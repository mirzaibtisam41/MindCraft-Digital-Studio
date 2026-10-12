'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/DataState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAdminModelsQuery } from '@/features/admin/adminApi';
import { AddModelForm } from '@/features/admin/models/AddModelForm';
import { ModelEditor } from '@/features/admin/models/ModelEditor';

export function ModelsView() {
  const { data, isLoading, error, refetch } = useGetAdminModelsQuery();
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Models & pricing"
        description="Add models, enable or disable them, set credit prices and limit which options users can pick. Changes apply to new generations immediately."
        actions={
          <Button
            type="button"
            disabled={!data || isAdding}
            onClick={() => setIsAdding(true)}
          >
            <Plus />
            Add model
          </Button>
        }
      />

      {error ? <ErrorState error={error} onRetry={refetch} /> : null}

      {isLoading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : null}

      {data && isAdding ? (
        <AddModelForm
          editable={data.editable}
          onClose={() => setIsAdding(false)}
        />
      ) : null}

      {data ? (
        <div className="flex flex-col gap-5">
          {data.models.map((model) => (
            <ModelEditor
              key={`${model.id}-${model.updatedAt}`}
              model={model}
              editable={data.editable}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
