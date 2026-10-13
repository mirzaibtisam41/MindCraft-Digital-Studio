'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FormAlert } from '@/components/ui/FormAlert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/Spinner';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useSaveModelWorkflowMutation } from '@/features/generation-types/generationTypesApi';
import { getErrorMessage } from '@/lib/apiError';

const OPTION_GROUPS = [
  { key: 'sizes', defaultKey: 'size', label: 'Sizes', defaultLabel: 'Size' },
  {
    key: 'qualities',
    defaultKey: 'quality',
    label: 'Qualities',
    defaultLabel: 'Quality',
  },
  {
    key: 'outputFormats',
    defaultKey: 'outputFormat',
    label: 'Output formats',
    defaultLabel: 'Format',
  },
];

function buildInitialState(workflow) {
  return {
    isEnabled: workflow.isEnabled,
    enabledOptions: workflow.enabledOptions ?? {
      sizes: [],
      qualities: [],
      outputFormats: [],
      maxImagesPerRequest: 1,
    },
    defaultOptions: workflow.defaultOptions ?? {
      size: '',
      quality: '',
      outputFormat: '',
      n: 1,
    },
  };
}

function keepDefaultsInsideEnabled(enabledOptions, defaultOptions) {
  const next = { ...defaultOptions };

  for (const group of OPTION_GROUPS) {
    const allowed = enabledOptions[group.key];

    if (!allowed.includes(next[group.defaultKey])) {
      next[group.defaultKey] = allowed[0] ?? '';
    }
  }

  next.n = Math.min(next.n, enabledOptions.maxImagesPerRequest);

  return next;
}

function numbersUpTo(max) {
  return Array.from({ length: max }, (_, index) => String(index + 1));
}

function DefaultSelect({ label, value, values, onChange }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-ink-3">{label}</span>
      <Select
        value={value}
        disabled={values.length === 0}
        onValueChange={onChange}
      >
        <SelectTrigger className="h-9">
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectContent>
          {values.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

export function WorkflowCard({ modelId, workflow, availableOptions }) {
  const [state, setState] = useState(() => buildInitialState(workflow));
  const [errorMessage, setErrorMessage] = useState('');
  const [saveModelWorkflow, { isLoading }] = useSaveModelWorkflowMutation();
  const { generationType } = workflow;

  const hasAnyOption = OPTION_GROUPS.some(
    (group) => state.enabledOptions[group.key].length > 0,
  );
  const hasEveryOption = OPTION_GROUPS.every(
    (group) => state.enabledOptions[group.key].length > 0,
  );

  function changeEnabledOptions(changes) {
    const enabledOptions = { ...state.enabledOptions, ...changes };

    setState({
      ...state,
      enabledOptions,
      defaultOptions: keepDefaultsInsideEnabled(
        enabledOptions,
        state.defaultOptions,
      ),
    });
  }

  function changeDefault(key, value) {
    setState({
      ...state,
      defaultOptions: { ...state.defaultOptions, [key]: value },
    });
  }

  async function handleSave() {
    setErrorMessage('');

    if (hasAnyOption && !hasEveryOption) {
      setErrorMessage('Choose at least one size, quality and output format.');

      return;
    }

    if (state.isEnabled && !hasEveryOption) {
      setErrorMessage('Choose the options before turning this workflow on.');

      return;
    }

    try {
      await saveModelWorkflow({
        modelId,
        typeId: generationType.id,
        isEnabled: state.isEnabled,
        enabledOptions: hasEveryOption ? state.enabledOptions : null,
        defaultOptions: hasEveryOption ? state.defaultOptions : null,
      }).unwrap();
      toast.success(`${generationType.name} saved`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <CardTitle className="flex items-center gap-2">
            {generationType.name}
            {generationType.isActive ? null : (
              <Badge tone="warning">Type is off</Badge>
            )}
          </CardTitle>
          <CardDescription>
            {generationType.description ?? generationType.code}
          </CardDescription>
        </div>
        <label className="flex shrink-0 items-center gap-2 text-sm">
          <span className="text-muted-foreground">
            {state.isEnabled ? 'On' : 'Off'}
          </span>
          <Switch
            checked={state.isEnabled}
            disabled={!generationType.isActive && !state.isEnabled}
            onCheckedChange={(isEnabled) => setState({ ...state, isEnabled })}
            aria-label={`Turn ${generationType.name} on or off`}
          />
        </label>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <FormAlert>{errorMessage}</FormAlert>

        {OPTION_GROUPS.map((group) => (
          <div key={group.key} className="flex flex-col gap-2">
            <p className="text-sm font-medium">{group.label}</p>
            <ToggleGroup
              type="multiple"
              variant="outline"
              spacing={1}
              className="flex-wrap"
              value={state.enabledOptions[group.key]}
              onValueChange={(values) =>
                changeEnabledOptions({ [group.key]: values })
              }
            >
              {availableOptions[group.key].map((option) => (
                <ToggleGroupItem
                  key={option}
                  value={option}
                  className="font-mono text-xs data-[state=on]:border-brand/40 data-[state=on]:bg-brand-tint data-[state=on]:text-foreground"
                >
                  {option}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        ))}

        <div className="flex flex-col gap-2 sm:max-w-48">
          <DefaultSelect
            label="Max images per request"
            value={String(state.enabledOptions.maxImagesPerRequest)}
            values={numbersUpTo(availableOptions.maxImagesPerRequest)}
            onChange={(value) =>
              changeEnabledOptions({ maxImagesPerRequest: Number(value) })
            }
          />
        </div>

        <div className="flex flex-col gap-3 rounded-lg border p-4">
          <p className="text-sm font-medium">Defaults for users</p>
          <div className="grid gap-3 sm:grid-cols-4">
            {OPTION_GROUPS.map((group) => (
              <DefaultSelect
                key={group.defaultKey}
                label={group.defaultLabel}
                value={state.defaultOptions[group.defaultKey]}
                values={state.enabledOptions[group.key]}
                onChange={(value) => changeDefault(group.defaultKey, value)}
              />
            ))}
            <DefaultSelect
              label="Images"
              value={String(state.defaultOptions.n)}
              values={numbersUpTo(state.enabledOptions.maxImagesPerRequest)}
              onChange={(value) => changeDefault('n', Number(value))}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? <Spinner /> : null}
          Save workflow
        </Button>
      </CardFooter>
    </Card>
  );
}
