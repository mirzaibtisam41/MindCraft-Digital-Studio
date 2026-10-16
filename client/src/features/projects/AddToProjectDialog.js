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
  useAddProjectImagesMutation,
  useCreateProjectMutation,
  useGetProjectsQuery,
} from '@/features/projects/projectsApi';
import { getErrorMessage } from '@/lib/apiError';

const NEW_PROJECT = 'new';

function AddToProjectForm({ imageIds, onDone }) {
  const { data } = useGetProjectsQuery({ page: 1, limit: 100 });
  const projects = data?.projects ?? [];
  const [chosenProjectId, setChosenProjectId] = useState(null);
  const [newName, setNewName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [createProject] = useCreateProjectMutation();
  const [addProjectImages] = useAddProjectImagesMutation();
  const projectId =
    chosenProjectId ?? (projects.length > 0 ? projects[0].id : NEW_PROJECT);
  const isNew = projectId === NEW_PROJECT;

  async function handleSubmit(event) {
    event.preventDefault();

    if (isNew && !newName.trim()) {
      toast.error('Give the new project a name.');
      return;
    }

    setIsSaving(true);

    try {
      const targetId = isNew
        ? (await createProject({ name: newName.trim() }).unwrap()).id
        : projectId;
      const addedIds = await addProjectImages({
        projectId: targetId,
        imageIds,
      }).unwrap();
      const projectName = isNew
        ? newName.trim()
        : projects.find((project) => project.id === targetId)?.name;
      toast.success(
        `${addedIds.length} ${addedIds.length === 1 ? 'image' : 'images'} added to ${projectName}`,
      );
      onDone();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field id="add-to-project" label="Project">
        <Select value={projectId} onValueChange={setChosenProjectId}>
          <SelectTrigger id="add-to-project" aria-label="Project">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
            <SelectItem value={NEW_PROJECT}>+ New project</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      {isNew ? (
        <Field id="new-project-name" label="New project name">
          <Input
            id="new-project-name"
            maxLength={100}
            placeholder="Spring campaign"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            autoFocus
          />
        </Field>
      ) : null}
      <DialogFooter>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? <Spinner /> : null}
          Add {imageIds.length} {imageIds.length === 1 ? 'image' : 'images'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AddToProjectDialog({ open, imageIds, onOpenChange, onAdded }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Add to project</DialogTitle>
        <DialogDescription>
          The images stay in My Creations too.
        </DialogDescription>
        {open ? (
          <AddToProjectForm
            imageIds={imageIds}
            onDone={() => {
              onOpenChange(false);
              onAdded?.();
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
