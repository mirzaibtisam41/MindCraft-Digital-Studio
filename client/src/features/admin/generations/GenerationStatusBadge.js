import { Badge } from '@/components/ui/badge';
import { GENERATION_STATUS_TONES } from '@/constants/admin';

export function GenerationStatusBadge({ status }) {
  return (
    <Badge tone={GENERATION_STATUS_TONES[status] ?? 'neutral'}>{status}</Badge>
  );
}
