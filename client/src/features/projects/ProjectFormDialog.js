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
import { Textarea } from '@/components/ui/textarea';
import {
  useCreateProjectMutation,
  useUpdateProjectMutation,
} from '@/features/projects/projectsApi';
import { getErrorMessage } from '@/lib/apiError';

function ProjectForm({ project, onDone }) {
  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [nameError, setNameError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [createProject, createState] = useCreateProjectMutation();
  const [updateProject, updateState] = useUpdateProjectMutation();
  const isSaving = createState.isLoading || updateState.isLoading;

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');
    setNameError(name.trim() ? '' : 'Give the project a name.');

    if (!name.trim()) return;

    const body = { name: name.trim(), description: description.trim() || null };

    try {
      const saved = project
        ? await updateProject({ projectId: project.id, ...body }).unwrap()
        : await createProject(body).unwrap();
      toast.success(project ? 'Project saved' : 'Project created');
      onDone(saved);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormAlert>{errorMessage}</FormAlert>
      <Field id="project-name" label="Name" error={nameError}>
        <Input
          id="project-name"
          maxLength={100}
          placeholder="Spring campaign"
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-invalid={Boolean(nameError)}
          autoFocus
        />
      </Field>
      <Field id="project-description" label="Description" hint="Optional">
        <Textarea
          id="project-description"
          maxLength={500}
          placeholder="What these images are for"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Field>
      <DialogFooter>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? <Spinner /> : null}
          {project ? 'Save project' : 'Create project'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ProjectFormDialog({ open, project, onOpenChange, onSaved }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{project ? 'Edit project' : 'New project'}</DialogTitle>
        <DialogDescription>
          Group images for a campaign, client or idea.
        </DialogDescription>
        {open ? (
          <ProjectForm
            project={project}
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
