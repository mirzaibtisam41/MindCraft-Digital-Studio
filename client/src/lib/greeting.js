const NOON_HOUR = 12;
const EVENING_HOUR = 17;

export function getGreeting(date = new Date()) {
  const hour = date.getHours();

  if (hour < NOON_HOUR) return 'Good morning';
  if (hour < EVENING_HOUR) return 'Good afternoon';

  return 'Good evening';
}
