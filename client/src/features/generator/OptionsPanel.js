import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/Field';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const TOGGLE_ITEM_CLASS =
  'min-w-14 font-mono text-xs capitalize data-[state=on]:border-brand/40 data-[state=on]:bg-brand-tint data-[state=on]:text-foreground';

function ChoiceGroup({ label, labelId, value, choices, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p id={labelId} className="text-sm leading-none font-medium">
        {label}
      </p>
      <ToggleGroup
        type="single"
        variant="outline"
        aria-labelledby={labelId}
        value={value}
        disabled={disabled}
        onValueChange={(next) => {
          if (next) onChange(next);
        }}
        className="flex-wrap"
      >
        {choices.map((choice) => (
          <ToggleGroupItem
            key={choice}
            value={choice}
            className={TOGGLE_ITEM_CLASS}
          >
            {choice}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

function CountStepper({ value, max, onChange, disabled }) {
  return (
    <Field id="generator-count" label="Images">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Fewer images"
          disabled={disabled || value <= 1}
          onClick={() => onChange(value - 1)}
        >
          <Minus />
        </Button>
        <output
          id="generator-count"
          className="w-6 text-center font-mono text-sm"
        >
          {value}
        </output>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="More images"
          disabled={disabled || value >= max}
          onClick={() => onChange(value + 1)}
        >
          <Plus />
        </Button>
      </div>
    </Field>
  );
}

function StylePresets({ styles, value, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p
        id="generator-style-label"
        className="text-sm leading-none font-medium"
      >
        Style preset
      </p>
      <ToggleGroup
        type="single"
        variant="outline"
        aria-labelledby="generator-style-label"
        value={value ?? ''}
        disabled={disabled}
        onValueChange={(next) => onChange(next || null)}
        className="flex-wrap gap-1.5"
        spacing={1}
      >
        {styles.map(({ id, label }) => (
          <ToggleGroupItem
            key={id}
            value={id}
            className="rounded-full text-xs data-[state=on]:border-brand/40 data-[state=on]:bg-brand-tint data-[state=on]:text-foreground"
          >
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

export function OptionsPanel({ model, styles, values, change, disabled }) {
  return (
    <div className="flex flex-col gap-5">
      <ChoiceGroup
        label="Aspect ratio"
        labelId="generator-ratio-label"
        value={values.aspectRatio}
        choices={model.aspectRatios}
        disabled={disabled}
        onChange={(next) => change('aspectRatio', next)}
      />
      <ChoiceGroup
        label="Quality"
        labelId="generator-quality-label"
        value={values.quality}
        choices={model.qualities}
        disabled={disabled}
        onChange={(next) => change('quality', next)}
      />
      <CountStepper
        value={values.count}
        max={model.maxImagesPerRequest}
        disabled={disabled}
        onChange={(next) => change('count', next)}
      />
      <StylePresets
        styles={styles}
        value={values.style}
        disabled={disabled}
        onChange={(next) => change('style', next)}
      />
    </div>
  );
}
