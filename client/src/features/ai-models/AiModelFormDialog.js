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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/Spinner';
import {
  useCreateAiModelMutation,
  useUpdateAiModelMutation,
} from '@/features/ai-models/aiModelsApi';
import { getErrorMessage } from '@/lib/apiError';

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const PROVIDER_MODEL_ID_PATTERN = /^[A-Za-z0-9._:/-]+$/;

const TEXTAREA_CLASSES =
  'min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-ink-3 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:border-input dark:bg-input/30';

function toSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function validate(values, isEditing) {
  const errors = {};

  if (!values.name.trim()) errors.name = 'Enter a name.';
  if (!/^\d+$/.test(String(values.sortOrder))) {
    errors.sortOrder = 'Use a whole number, 0 or more.';
  }

  if (isEditing) return errors;

  if (!values.providerId) errors.providerId = 'Choose a provider.';
  if (!SLUG_PATTERN.test(values.slug)) {
    errors.slug = 'Use lowercase letters, numbers and single dashes.';
  }
  if (!PROVIDER_MODEL_ID_PATTERN.test(values.providerModelId.trim())) {
    errors.providerModelId = 'Use the exact model ID from the provider.';
  }

  return errors;
}

function ModelForm({ model, providers, onDone }) {
  const isEditing = Boolean(model);
  const [values, setValues] = useState({
    providerId: model?.providerId ?? '',
    name: model?.name ?? '',
    slug: model?.slug ?? '',
    providerModelId: model?.providerModelId ?? '',
    description: model?.description ?? '',
    sortOrder: model?.sortOrder ?? 0,
  });
  const [isSlugEdited, setIsSlugEdited] = useState(isEditing);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [createAiModel, { isLoading: isCreating }] = useCreateAiModelMutation();
  const [updateAiModel, { isLoading: isUpdating }] = useUpdateAiModelMutation();
  const isSaving = isCreating || isUpdating;

  function handleChange(event) {
    const { name, value } = event.target;
    const nextValues = { ...values, [name]: value };

    if (name === 'name' && !isSlugEdited) nextValues.slug = toSlug(value);
    if (name === 'slug') setIsSlugEdited(true);

    setValues(nextValues);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');

    const errors = validate(values, isEditing);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    const sharedFields = {
      name: values.name.trim(),
      description: values.description.trim() || null,
      sortOrder: Number(values.sortOrder),
    };

    try {
      if (isEditing) {
        await updateAiModel({ id: model.id, ...sharedFields }).unwrap();
        toast.success('Model updated');
      } else {
        await createAiModel({
          ...sharedFields,
          description: sharedFields.description ?? undefined,
          providerId: values.providerId,
          slug: values.slug,
          providerModelId: values.providerModelId.trim(),
        }).unwrap();
        toast.success('Model added as draft');
      }

      onDone();
    } catch (error) {
      if (error.status === 409) {
        const field = /slug/i.test(error.data?.message ?? '')
          ? 'slug'
          : 'providerModelId';
        setFieldErrors({ [field]: getErrorMessage(error) });

        return;
      }

      setErrorMessage(getErrorMessage(error));
    }
  }

  const lockedHint = 'This cannot be changed after the model is created.';

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormAlert>{errorMessage}</FormAlert>

      <Field
        id="model-provider"
        label="Provider"
        error={fieldErrors.providerId}
        hint={isEditing ? lockedHint : undefined}
      >
        <Select
          value={values.providerId}
          disabled={isEditing}
          onValueChange={(providerId) => setValues({ ...values, providerId })}
        >
          <SelectTrigger
            id="model-provider"
            aria-invalid={Boolean(fieldErrors.providerId)}
          >
            <SelectValue placeholder="Choose a provider" />
          </SelectTrigger>
          <SelectContent>
            {providers.map((provider) => (
              <SelectItem key={provider.id} value={provider.id}>
                {provider.name}
                {provider.isActive ? '' : ' (inactive)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field id="model-name" label="Name" error={fieldErrors.name}>
        <Input
          id="model-name"
          name="name"
          placeholder="GPT Image 1"
          autoFocus
          value={values.name}
          onChange={handleChange}
          aria-invalid={Boolean(fieldErrors.name)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="model-slug"
          label="Slug"
          error={fieldErrors.slug}
          hint={isEditing ? lockedHint : 'Filled from the name.'}
        >
          <Input
            id="model-slug"
            name="slug"
            placeholder="gpt-image-1"
            className="font-mono"
            disabled={isEditing}
            value={values.slug}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.slug)}
          />
        </Field>

        <Field
          id="model-provider-model-id"
          label="Provider model ID"
          error={fieldErrors.providerModelId}
          hint={isEditing ? lockedHint : 'As the provider names it.'}
        >
          <Input
            id="model-provider-model-id"
            name="providerModelId"
            placeholder="gpt-image-1"
            className="font-mono"
            disabled={isEditing}
            value={values.providerModelId}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.providerModelId)}
          />
        </Field>
      </div>

      <Field id="model-description" label="Description">
        <textarea
          id="model-description"
          name="description"
          placeholder="What this model is good at"
          className={TEXTAREA_CLASSES}
          value={values.description}
          onChange={handleChange}
        />
      </Field>

      <Field
        id="model-sort-order"
        label="Sort order"
        error={fieldErrors.sortOrder}
        hint="Lower numbers are shown first."
        className="sm:max-w-40"
      >
        <Input
          id="model-sort-order"
          name="sortOrder"
          type="number"
          min="0"
          value={values.sortOrder}
          onChange={handleChange}
          aria-invalid={Boolean(fieldErrors.sortOrder)}
        />
      </Field>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? <Spinner /> : null}
          {isEditing ? 'Save changes' : 'Add model'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AiModelFormDialog({ open, model, providers, onOpenChange }) {
  const isEditing = Boolean(model);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <div className="flex flex-col gap-1 pr-6">
          <DialogTitle>{isEditing ? 'Edit model' : 'Add model'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Change how this model is named, described and ordered.'
              : 'New models start as draft. Activate them when they are ready.'}
          </DialogDescription>
        </div>
        {open ? (
          <ModelForm
            key={model?.id ?? 'new'}
            model={model}
            providers={providers}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
