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
import { CATEGORY_LABELS } from '@/features/prompts/promptLabels';
import {
  useCreatePromptMutation,
  useUpdatePromptMutation,
} from '@/features/prompts/promptsApi';
import { getErrorMessage } from '@/lib/apiError';

function SaveForm({ text, style, prompt, categories, onDone }) {
  const [title, setTitle] = useState(prompt?.title ?? text.slice(0, 60));
  const [category, setCategory] = useState(prompt?.category ?? 'other');
  const [errorMessage, setErrorMessage] = useState('');
  const [createPrompt, createState] = useCreatePromptMutation();
  const [updatePrompt, updateState] = useUpdatePromptMutation();
  const isSaving = createState.isLoading || updateState.isLoading;

  async function handleSubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!title.trim()) {
      setErrorMessage('Give the prompt a title.');
      return;
    }

    const body = { title: title.trim(), text, category, style: style ?? null };

    try {
      const saved = prompt
        ? await updatePrompt({ id: prompt.id, ...body }).unwrap()
        : await createPrompt(body).unwrap();
      toast.success('Prompt saved');
      onDone(saved);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormAlert>{errorMessage}</FormAlert>
      <Field id="prompt-title" label="Title">
        <Input
          id="prompt-title"
          maxLength={120}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          autoFocus
        />
      </Field>
      <Field id="prompt-category" label="Category">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id="prompt-category" aria-label="Category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((item) => (
              <SelectItem key={item} value={item}>
                {CATEGORY_LABELS[item] ?? item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <p className="max-h-32 overflow-y-auto rounded-lg border bg-background p-3 text-sm text-muted-foreground">
        {text}
      </p>
      <DialogFooter>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? <Spinner /> : null}
          {prompt ? 'Save changes' : 'Save prompt'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function SavePromptDialog({
  open,
  text,
  style,
  prompt,
  categories,
  onOpenChange,
  onSaved,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>
          {prompt ? 'Update saved prompt' : 'Save prompt'}
        </DialogTitle>
        <DialogDescription>
          Saved prompts appear on the left so you can reuse them.
        </DialogDescription>
        {open ? (
          <SaveForm
            text={text}
            style={style}
            prompt={prompt}
            categories={categories}
            onDone={(saved) => {
              onOpenChange(false);
              onSaved?.(saved);
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
