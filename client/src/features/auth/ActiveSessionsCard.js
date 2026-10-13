'use client';

import { Laptop } from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { FormAlert } from '@/components/ui/FormAlert';
import {
  useGetSessionsQuery,
  useLogoutOtherSessionsMutation,
  useRevokeSessionMutation,
} from '@/features/auth/authApi';
import { getErrorMessage } from '@/lib/apiError';

const BROWSERS = [
  ['Edg/', 'Edge'],
  ['OPR/', 'Opera'],
  ['Chrome/', 'Chrome'],
  ['Firefox/', 'Firefox'],
  ['Safari/', 'Safari'],
];

const SYSTEMS = [
  ['Windows', 'Windows'],
  ['Android', 'Android'],
  ['iPhone', 'iPhone'],
  ['iPad', 'iPad'],
  ['Mac OS', 'macOS'],
  ['Linux', 'Linux'],
];

function findName(list, userAgent) {
  return list.find(([needle]) => userAgent.includes(needle))?.[1];
}

function describeDevice(userAgent) {
  if (!userAgent) return 'Unknown device';

  const browser = findName(BROWSERS, userAgent) ?? 'Browser';
  const system = findName(SYSTEMS, userAgent);

  return system ? `${browser} on ${system}` : browser;
}

function formatDate(value) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function ActiveSessionsCard() {
  const { data: sessions, isLoading, error } = useGetSessionsQuery();
  const [revokeSession, { isLoading: isRevoking, originalArgs: revokingId }] =
    useRevokeSessionMutation();
  const [logoutOtherSessions, { isLoading: isLoggingOutOthers }] =
    useLogoutOtherSessionsMutation();

  const hasOtherSessions = sessions?.some((session) => !session.isCurrent);

  async function handleRevoke(familyId) {
    try {
      await revokeSession(familyId).unwrap();
      toast.success('Device logged out');
    } catch (revokeError) {
      toast.error(getErrorMessage(revokeError));
    }
  }

  async function handleLogoutOthers() {
    try {
      const { loggedOutCount } = await logoutOtherSessions().unwrap();
      toast.success(
        `Logged out from ${loggedOutCount} other ${loggedOutCount === 1 ? 'device' : 'devices'}`,
      );
    } catch (logoutError) {
      toast.error(getErrorMessage(logoutError));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active sessions</CardTitle>
        <CardDescription>
          Devices where you are logged in. Log out any device you do not
          recognize.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {error ? <FormAlert>{getErrorMessage(error)}</FormAlert> : null}

        {isLoading
          ? [1, 2].map((row) => <Skeleton key={row} className="h-14 w-full" />)
          : null}

        {sessions?.map((session) => (
          <div
            key={session.familyId}
            className="flex items-center gap-3 rounded-lg border p-3"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Laptop className="size-4" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-medium">
                <span className="truncate">
                  {describeDevice(session.userAgent)}
                </span>
                {session.isCurrent ? (
                  <Badge tone="success">This device</Badge>
                ) : null}
              </p>
              <p className="truncate text-xs text-ink-3">
                {session.ipAddress ?? 'Unknown IP'} · Last active{' '}
                {formatDate(session.lastActiveAt)}
              </p>
            </div>

            {session.isCurrent ? null : (
              <Button
                variant="outline"
                size="sm"
                disabled={isRevoking && revokingId === session.familyId}
                onClick={() => handleRevoke(session.familyId)}
              >
                Log out
              </Button>
            )}
          </div>
        ))}
      </CardContent>

      <CardFooter>
        <Button
          variant="outline"
          disabled={!hasOtherSessions || isLoggingOutOthers}
          onClick={handleLogoutOthers}
        >
          Log out other devices
        </Button>
      </CardFooter>
    </Card>
  );
}
