import { Badge } from '@/components/ui/badge';
import { IMAGE_MODEL_BADGE_LABELS } from '@/constants/admin';

export function ModelBadges({ model, showStatus = false }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {showStatus ? (
        <Badge tone={model.enabled ? 'success' : 'neutral'}>
          {model.enabled ? 'Enabled' : 'Disabled'}
        </Badge>
      ) : null}
      {model.isDefault ? <Badge tone="brand">Default</Badge> : null}
      {model.badge ? (
        <Badge>{IMAGE_MODEL_BADGE_LABELS[model.badge] ?? model.badge}</Badge>
      ) : null}
    </span>
  );
}
