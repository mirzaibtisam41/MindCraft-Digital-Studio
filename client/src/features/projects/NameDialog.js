'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field } from '@/components/ui/Field';
import { FormAlert } from '@/components/ui/FormAlert';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/Spinner';
import { getErrorMessage } from '@/lib/apiError';

function NameForm({ initialName, label, submitLabel, onSubmit }) {
  const [name, setName] = useState(initialName ?? '');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      setErrorMessage(`${label} cannot be empty.`);
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      await onSubmit(name.trim());
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormAlert>{errorMessage}</FormAlert>
      <Field id="name-dialog-input" label={label}>
        <Input
          id="name-dialog-input"
          maxLength={60}
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoFocus
        />
      </Field>
      <DialogFooter>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? <Spinner /> : null}
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function NameDialog({
  open,
  title,
  label,
  initialName,
  submitLabel,
  onOpenChange,
  onSubmit,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        {open ? (
          <NameForm
            initialName={initialName}
            label={label}
            submitLabel={submitLabel}
            onSubmit={onSubmit}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
