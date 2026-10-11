import { Switch } from '@/components/ui/switch';

export function SettingToggle({ id, label, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <label htmlFor={id} className="font-medium">
          {label}
        </label>
        {description ? (
          <p
            id={`${id}-description`}
            className="text-[12.5px] text-muted-foreground"
          >
            {description}
          </p>
        ) : null}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        aria-describedby={description ? `${id}-description` : undefined}
      />
    </div>
  );
}
