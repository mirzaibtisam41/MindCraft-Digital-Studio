'use client';

import { BackLink } from '@/components/ui/BackLink';
import { ErrorState } from '@/components/ui/DataState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAdminModelsQuery } from '@/features/admin/adminApi';
import { AddModelForm } from '@/features/admin/models/AddModelForm';

export function NewModelView() {
  const { data, isLoading, error, refetch } = useGetAdminModelsQuery();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <BackLink href="/admin/models">All models</BackLink>

      <PageHeader
        title="Add image model"
        description="The id must match the provider's model id exactly. New models start with the standard image options, which you can fine-tune on the next screen. If the provider rejects the id, users are not charged."
      />

      {error ? <ErrorState error={error} onRetry={refetch} /> : null}
      {isLoading ? <Skeleton className="h-96 w-full" /> : null}
      {data ? <AddModelForm editable={data.editable} /> : null}
    </div>
  );
}
