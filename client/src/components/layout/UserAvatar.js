import { cn } from '@/lib/utils';

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export function UserAvatar({ name, className }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-tint text-xs font-semibold text-brand',
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
}
