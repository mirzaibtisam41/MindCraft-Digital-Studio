'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field } from '@/components/ui/Field';
import { FormAlert } from '@/components/ui/FormAlert';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/Spinner';
import { Switch } from '@/components/ui/switch';
import {
  useCreateAiProviderMutation,
  useUpdateAiProviderMutation,
} from '@/features/ai-providers/aiProvidersApi';
import { getErrorMessage } from '@/lib/apiError';

const CODE_PATTERN = /^[a-z0-9-]+$/;

function validate({ name, code }) {
  const errors = {};

  if (!name.trim()) errors.name = 'Enter a name.';
  if (!CODE_PATTERN.test(code.trim().toLowerCase())) {
    errors.code = 'Use lowercase letters, numbers and dashes only.';
  }

  return errors;
}

function ProviderForm({ provider, onDone }) {
  const isEditing = Boolean(provider);
  const [values, setValues] = useState({
    name: provider?.name ?? '',
    code: provider?.code ?? '',
    isActive: provider?.isActive ?? false,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [createAiProvider, { isLoading: isCreating }] =
    useCreateAiProviderMutation();
  const [updateAiProvider, { isLoading: isUpdating }] =
    useUpdateAiProviderMutation();
  const isSaving = isCreating || isUpdating;

  function handleChange(event) {
    setValues({ ...values, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');

    const errors = validate(values);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      if (isEditing) {
        await updateAiProvider({
          id: provider.id,
          name: values.name.trim(),
        }).unwrap();
        toast.success('Provider updated');
      } else {
        await createAiProvider({
          name: values.name.trim(),
          code: values.code.trim().toLowerCase(),
          isActive: values.isActive,
        }).unwrap();
        toast.success('Provider added');
      }

      onDone();
    } catch (error) {
      if (error.status === 409) {
        setFieldErrors({ code: getErrorMessage(error) });

        return;
      }

      setErrorMessage(getErrorMessage(error));
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormAlert>{errorMessage}</FormAlert>

      <Field id="provider-name" label="Name" error={fieldErrors.name}>
        <Input
          id="provider-name"
          name="name"
          placeholder="OpenAI"
          autoFocus
          value={values.name}
          onChange={handleChange}
          aria-invalid={Boolean(fieldErrors.name)}
        />
      </Field>

      <Field
        id="provider-code"
        label="Code"
        error={fieldErrors.code}
        hint={
          isEditing
            ? 'The code cannot be changed after the provider is created.'
            : 'A short unique id, for example openai.'
        }
      >
        <Input
          id="provider-code"
          name="code"
          placeholder="openai"
          className="font-mono"
          disabled={isEditing}
          value={values.code}
          onChange={handleChange}
          aria-invalid={Boolean(fieldErrors.code)}
        />
      </Field>

      {isEditing ? null : (
        <label className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
          <span>
            <span className="block font-medium">Active</span>
            <span className="text-xs text-ink-3">
              Inactive providers can be turned on later.
            </span>
          </span>
          <Switch
            checked={values.isActive}
            onCheckedChange={(isActive) => setValues({ ...values, isActive })}
          />
        </label>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? <Spinner /> : null}
          {isEditing ? 'Save changes' : 'Add provider'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AiProviderFormDialog({ open, provider, onOpenChange }) {
  const isEditing = Boolean(provider);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="flex flex-col gap-1 pr-6">
          <DialogTitle>
            {isEditing ? 'Edit provider' : 'Add provider'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Change how this provider is shown to admins.'
              : 'Add an AI provider that image models can belong to.'}
          </DialogDescription>
        </div>
        {open ? (
          <ProviderForm
            key={provider?.id ?? 'new'}
            provider={provider}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
