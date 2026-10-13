import { Check, X } from 'lucide-react';
import { Field } from '@/components/ui/Field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const CAPABILITY_CHIPS = [
  { key: 'seed', label: 'Seed' },
  { key: 'negativePrompt', label: 'Negative prompt' },
  { key: 'strength', label: 'Strength' },
];

function CapabilityChip({ label, status }) {
  const supported = status === 'supported';

  return (
    <li
      className={cn(
        'flex items-center gap-1 rounded-full border px-2 text-[11px] leading-5',
        supported ? 'text-foreground' : 'text-ink-3 line-through',
      )}
    >
      {supported ? (
        <Check className="size-3 text-success" aria-hidden="true" />
      ) : (
        <X className="size-3" aria-hidden="true" />
      )}
      {label}
    </li>
  );
}

function cheapestCost(creditsPerImage) {
  return Math.min(...Object.values(creditsPerImage));
}

export function ModelPicker({ model, models, onChange, disabled }) {
  return (
    <Field
      id="generator-model"
      label="Model"
      hint={model.description || 'Controls adapt to the selected model.'}
    >
      <Select value={model.id} disabled={disabled} onValueChange={onChange}>
        <SelectTrigger id="generator-model">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {models.map(({ id, label, creditsPerImage }) => (
            <SelectItem key={id} value={id}>
              {label} · from {cheapestCost(creditsPerImage)} cr / image
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ul className="flex flex-wrap gap-1.5" aria-label="Model capabilities">
        {CAPABILITY_CHIPS.map(({ key, label }) => (
          <CapabilityChip
            key={key}
            label={label}
            status={model.features[key]}
          />
        ))}
      </ul>
    </Field>
  );
}
