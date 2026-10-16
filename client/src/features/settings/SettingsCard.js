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
import { Spinner } from '@/components/ui/Spinner';

export function SettingsCard({
  title,
  description,
  errorMessage,
  isDirty,
  isSaving,
  onSave,
  onDiscard,
  saveLabel = 'Save changes',
  children,
}) {
  function handleSubmit(event) {
    event.preventDefault();

    if (isDirty && !isSaving) onSave();
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} noValidate>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 pt-5">
          <FormAlert>{errorMessage}</FormAlert>
          {children}
        </CardContent>
        <CardFooter className="justify-end gap-2 pt-5">
          <Button
            type="button"
            variant="ghost"
            disabled={!isDirty || isSaving}
            onClick={onDiscard}
          >
            Discard
          </Button>
          <Button type="submit" disabled={!isDirty || isSaving}>
            {isSaving ? <Spinner /> : null}
            {saveLabel}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export function SettingsSwitchRow({ id, label, description, children }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}
