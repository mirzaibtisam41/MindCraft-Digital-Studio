'use client';

import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/Spinner';
import { useUpdateAdminModelMutation } from '@/features/admin/adminApi';
import { getErrorMessage } from '@/lib/apiError';

export function MakeDefaultButton({ model }) {
  const [updateModel, { isLoading }] = useUpdateAdminModelMutation();

  async function handleClick() {
    try {
      await updateModel({ id: model.id, body: { isDefault: true } }).unwrap();
      toast.success(`${model.label} is now the default model`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={!model.enabled || isLoading}
      title={model.enabled ? undefined : 'Enable the model first'}
      onClick={handleClick}
    >
      {isLoading ? <Spinner /> : <Star />}
      Make default
    </Button>
  );
}
