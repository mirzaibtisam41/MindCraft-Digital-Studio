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
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/Spinner';
import { Switch } from '@/components/ui/switch';
import {
  useCreateGenerationTypeMutation,
  useUpdateGenerationTypeMutation,
} from '@/features/generation-types/generationTypesApi';
import { getErrorMessage } from '@/lib/apiError';

const CODE_PATTERN = /^[a-z0-9_]+$/;

function validate({ name, code }, isEditing) {
  const errors = {};

  if (!name.trim()) errors.name = 'Enter a name.';
  if (!isEditing && !CODE_PATTERN.test(code.trim().toLowerCase())) {
    errors.code = 'Use lowercase letters, numbers and underscores only.';
  }

  return errors;
}

function GenerationTypeForm({ generationType, onDone }) {
  const isEditing = Boolean(generationType);
  const [values, setValues] = useState({
    name: generationType?.name ?? '',
    code: generationType?.code ?? '',
    description: generationType?.description ?? '',
    isActive: generationType?.isActive ?? true,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [createGenerationType, { isLoading: isCreating }] =
    useCreateGenerationTypeMutation();
  const [updateGenerationType, { isLoading: isUpdating }] =
    useUpdateGenerationTypeMutation();
  const isSaving = isCreating || isUpdating;

  function handleChange(event) {
    setValues({ ...values, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');

    const errors = validate(values, isEditing);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      if (isEditing) {
        await updateGenerationType({
          id: generationType.id,
          name: values.name.trim(),
          description: values.description.trim() || null,
        }).unwrap();
        toast.success('Generation type updated');
      } else {
        await createGenerationType({
          code: values.code.trim().toLowerCase(),
          name: values.name.trim(),
          description: values.description.trim() || undefined,
          isActive: values.isActive,
        }).unwrap();
        toast.success('Generation type added');
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

      <Field id="type-name" label="Name" error={fieldErrors.name}>
        <Input
          id="type-name"
          name="name"
          placeholder="Image Upscaling"
          autoFocus
          value={values.name}
          onChange={handleChange}
          aria-invalid={Boolean(fieldErrors.name)}
        />
      </Field>

      <Field
        id="type-code"
        label="Code"
        error={fieldErrors.code}
        hint={
          isEditing
            ? 'The code cannot be changed after the type is created.'
            : 'A short unique id, for example upscaling.'
        }
      >
        <Input
          id="type-code"
          name="code"
          placeholder="upscaling"
          className="font-mono"
          disabled={isEditing}
          value={values.code}
          onChange={handleChange}
          aria-invalid={Boolean(fieldErrors.code)}
        />
      </Field>

      <Field id="type-description" label="Description">
        <Textarea
          id="type-description"
          name="description"
          placeholder="What this workflow does"
          value={values.description}
          onChange={handleChange}
        />
      </Field>

      {isEditing ? null : (
        <label className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
          <span>
            <span className="block font-medium">On</span>
            <span className="text-xs text-ink-3">
              Models can only use generation types that are on.
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
          {isEditing ? 'Save changes' : 'Add generation type'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function GenerationTypeFormDialog({
  open,
  generationType,
  onOpenChange,
}) {
  const isEditing = Boolean(generationType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="flex flex-col gap-1 pr-6">
          <DialogTitle>
            {isEditing ? 'Edit generation type' : 'Add generation type'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Change how this workflow is named and described.'
              : 'Add an image workflow that models can offer.'}
          </DialogDescription>
        </div>
        {open ? (
          <GenerationTypeForm
            key={generationType?.id ?? 'new'}
            generationType={generationType}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
