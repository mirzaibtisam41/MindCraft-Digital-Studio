'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
import { Switch } from '@/components/ui/switch';
import { IMAGE_PROVIDER_OPTIONS } from '@/constants/admin';
import { useCreateAdminModelMutation } from '@/features/admin/adminApi';
import { getErrorMessage } from '@/lib/apiError';

const MODEL_ID_PATTERN = /^[a-z0-9][a-z0-9._-]*$/;
const MODEL_ID_MAX_LENGTH = 100;
const LABEL_MAX_LENGTH = 100;

function buildInitialState(qualities) {
  return {
    id: '',
    provider: IMAGE_PROVIDER_OPTIONS[0].value,
    label: '',
    description: '',
    enabled: true,
    credits: Object.fromEntries(qualities.map((quality) => [quality, ''])),
  };
}

function validate({ values, editable }) {
  const errors = {};
  const { min, max } = editable.creditsPerImage;

  if (
    !MODEL_ID_PATTERN.test(values.id) ||
    values.id.length > MODEL_ID_MAX_LENGTH
  ) {
    errors.id =
      'Use lowercase letters, numbers, dots, dashes or underscores, starting with a letter or number.';
  }

  if (!values.label.trim()) errors.label = 'Enter a display name.';

  for (const quality of editable.qualities) {
    const parsed = Number(values.credits[quality]);

    if (
      values.credits[quality].trim() === '' ||
      !Number.isInteger(parsed) ||
      parsed < min ||
      parsed > max
    ) {
      errors[`credits-${quality}`] = `Enter ${min}–${max}.`;
    }
  }

  return errors;
}

export function AddModelForm({ editable }) {
  const router = useRouter();
  const [createModel, { isLoading }] = useCreateAdminModelMutation();
  const [values, setValues] = useState(() =>
    buildInitialState(editable.qualities),
  );
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validate({ values, editable });

    setErrors(nextErrors);
    setFormError('');

    if (Object.keys(nextErrors).length > 0) return;

    try {
      const created = await createModel({
        id: values.id,
        provider: values.provider,
        label: values.label.trim(),
        description: values.description.trim(),
        enabled: values.enabled,
        creditsPerImage: Object.fromEntries(
          editable.qualities.map((quality) => [
            quality,
            Number(values.credits[quality]),
          ]),
        ),
      }).unwrap();

      toast.success(`${created.label} added`);
      router.push(`/admin/models/${encodeURIComponent(created.id)}`);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Add image model"
      className="rounded-xl border bg-card"
    >
      <div className="flex flex-col gap-5 px-5 py-5">
        <FormAlert>{formError}</FormAlert>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="new-model-id"
            label="Model id"
            error={errors.id}
            hint="Example: gpt-image-1.5"
          >
            <Input
              id="new-model-id"
              className="h-10 font-mono"
              placeholder="gpt-image-1.5"
              maxLength={MODEL_ID_MAX_LENGTH}
              value={values.id}
              onChange={(event) =>
                setValues({ ...values, id: event.target.value.trim() })
              }
              aria-invalid={Boolean(errors.id)}
              aria-describedby={errors.id ? 'new-model-id-error' : undefined}
            />
          </Field>
          <Field id="new-model-provider" label="Provider">
            <Select
              value={values.provider}
              onValueChange={(provider) => setValues({ ...values, provider })}
            >
              <SelectTrigger id="new-model-provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {IMAGE_PROVIDER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field id="new-model-label" label="Display name" error={errors.label}>
          <Input
            id="new-model-label"
            className="h-10"
            placeholder="GPT Image 1.5"
            maxLength={LABEL_MAX_LENGTH}
            value={values.label}
            onChange={(event) =>
              setValues({ ...values, label: event.target.value })
            }
            aria-invalid={Boolean(errors.label)}
            aria-describedby={
              errors.label ? 'new-model-label-error' : undefined
            }
          />
        </Field>

        <Field
          id="new-model-description"
          label="Description"
          hint="Optional. One line shown to users in the model picker."
        >
          <Input
            id="new-model-description"
            className="h-10"
            placeholder="Fast and cheap, great for drafts"
            maxLength={editable.descriptionMaxLength}
            value={values.description}
            onChange={(event) =>
              setValues({ ...values, description: event.target.value })
            }
          />
        </Field>

        <div className="flex flex-col gap-3">
          <h3 className="text-[10.5px] font-semibold tracking-wider text-ink-3 uppercase">
            Credits per image
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {editable.qualities.map((quality) => (
              <Field
                key={quality}
                id={`new-model-credits-${quality}`}
                label={`${quality[0].toUpperCase()}${quality.slice(1)} quality`}
                error={errors[`credits-${quality}`]}
              >
                <Input
                  id={`new-model-credits-${quality}`}
                  type="number"
                  inputMode="numeric"
                  className="h-10 font-mono"
                  placeholder="e.g. 2"
                  value={values.credits[quality]}
                  onChange={(event) =>
                    setValues({
                      ...values,
                      credits: {
                        ...values.credits,
                        [quality]: event.target.value,
                      },
                    })
                  }
                  aria-invalid={Boolean(errors[`credits-${quality}`])}
                />
              </Field>
            ))}
          </div>
        </div>

        <label
          htmlFor="new-model-enabled"
          className="flex items-center gap-2 text-[13px]"
        >
          <Switch
            id="new-model-enabled"
            checked={values.enabled}
            onCheckedChange={(enabled) => setValues({ ...values, enabled })}
          />
          Available to users right away
        </label>
      </div>

      <div className="flex justify-end gap-2 border-t px-5 py-3">
        <Button asChild variant="ghost">
          <Link href="/admin/models">Cancel</Link>
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Spinner /> : null}
          Add model
        </Button>
      </div>
    </form>
  );
}
