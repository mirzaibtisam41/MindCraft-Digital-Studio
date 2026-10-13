'use client';

import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { useUpdateAdminModelMutation } from '@/features/admin/adminApi';
import { getErrorMessage } from '@/lib/apiError';

export function ModelStatusSwitch({ model }) {
  const [updateModel, { isLoading }] = useUpdateAdminModelMutation();

  async function handleChange(enabled) {
    try {
      await updateModel({ id: model.id, body: { enabled } }).unwrap();
      toast.success(`${model.label} ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <Switch
      checked={model.enabled}
      disabled={isLoading}
      onCheckedChange={handleChange}
      aria-label={`${model.enabled ? 'Disable' : 'Enable'} ${model.label}`}
    />
  );
}
